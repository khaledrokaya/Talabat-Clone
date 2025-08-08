import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPDocument extends Document {
  email: string;
  otp: string;
  purpose: 'email_verification' | 'password_reset';
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTPDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ email: 1, purpose: 1, isUsed: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

otpSchema.statics.findValidOTP = function (
  email: string,
  otp: string,
  purpose: string,
) {
  return this.findOne({
    email: email.toLowerCase(),
    otp,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
};

otpSchema.statics.createOTP = async function (
  email: string,
  otp: string,
  purpose: string,
) {
  await this.deleteMany({
    email: email.toLowerCase(),
    purpose,
  });

  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 10);

  return this.create({
    email: email.toLowerCase(),
    otp,
    purpose,
    expiresAt: expiryTime,
  });
};

otpSchema.statics.incrementAttempts = function (
  email: string,
  purpose: string,
) {
  return this.updateOne(
    {
      email: email.toLowerCase(),
      purpose,
      isUsed: false,
    },
    {
      $inc: { attempts: 1 },
    },
  );
};

otpSchema.methods.markAsUsed = function () {
  this.isUsed = true;
  return this.save();
};

otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

otpSchema.methods.isMaxAttemptsReached = function () {
  return this.attempts >= this.maxAttempts;
};

export const OTP = mongoose.model<IOTPDocument>('OTP', otpSchema);
export default OTP;
