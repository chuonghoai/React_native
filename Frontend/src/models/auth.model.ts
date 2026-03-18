export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
  fullname?: string;
  phone?: string;
  avatarUrl?: string;
  avatar?: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
};

export type LoginData = {
  token?: string;
  accessToken?: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
  };
};
