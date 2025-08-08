import { Schema } from 'mongoose';
import { User, IBaseUser } from '../../shared/schemas/base-user.schema';

export interface IAdmin extends IBaseUser {
  role: 'admin';
  lastPasswordChange?: Date;
}

const adminSchema = new Schema({
  lastPasswordChange: {
    type: Date,
    default: Date.now,
  },
});

export const Admin = User.discriminator<IAdmin>('admin', adminSchema);
