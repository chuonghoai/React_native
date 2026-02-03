import type { ApiResponse } from "@/src/models/api.model";
import type {
  ForgotPasswordRequest,
  LoginData,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "@/src/models/auth.model";
import { ENDPOINTS } from "@/src/services/api/endpoints";
import { http } from "@/src/services/api/http";
import { UserData } from "../models/user.model";

export const authService = {
  register(payload: RegisterRequest) {
    return http.post<ApiResponse>(ENDPOINTS.REGISTER, payload);
  },

  verifyOtp(payload: VerifyOtpRequest) {
    return http.post<ApiResponse>(ENDPOINTS.VERIFY_OTP, payload);
  },

  login(payload: LoginRequest) {
    return http.post<ApiResponse<LoginData>>(ENDPOINTS.LOGIN, payload);
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return http.post<ApiResponse>(ENDPOINTS.FORGOT_PASSWORD, payload);
  },

  resetPassword(payload: ResetPasswordRequest) {
    return http.post<ApiResponse>(ENDPOINTS.RESET_PASSWORD, payload);
  },

  logout() {
    return http.post<ApiResponse>(ENDPOINTS.LOGOUT);
  },

  getMe() {
    return http.get<ApiResponse<UserData>>(ENDPOINTS.GET_ME);
  },
};
