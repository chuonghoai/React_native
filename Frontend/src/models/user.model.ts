export type UserData = {
  id: number;
  email: string;
  fullname: string;
  username: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
};

export type UpdateProfileRequest = {
  fullname?: string;
  phone?: string;
  avatarUrl?: string;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export type VerifyChangeEmailRequest = {
  newEmail: string;
  otp: string;
};