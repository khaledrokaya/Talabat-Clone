export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isEmailVerified: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

export interface IRegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
    verificationStatus?: string;
    createdAt: string;
  };
}

export interface IVerifyOTPResponse extends IAuthResponse {
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isEmailVerified: boolean;
      isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface IOTPRecord {
  email: string;
  otp: string;
  type: 'registration' | 'password-reset';
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
}
