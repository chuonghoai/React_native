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
    if (payload.avatar) {
      const formData = new FormData();
      formData.append("email", payload.email);
      formData.append("otp", payload.otp);

      if (payload.fullname) formData.append("fullname", payload.fullname);
      if (payload.phone) formData.append("phone", payload.phone);
      if (payload.avatarUrl) formData.append("avatarUrl", payload.avatarUrl);

      const filename = payload.avatar.split("/").pop() || "avatar.jpg";
      const extension = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase();
      const type = extension ? `image/${extension === "jpg" ? "jpeg" : extension}` : "image/jpeg";

      formData.append("file", {
        uri: payload.avatar,
        name: filename,
        type,
      } as any);

      return http.upload<ApiResponse>(ENDPOINTS.VERIFY_OTP, formData);
    }

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
