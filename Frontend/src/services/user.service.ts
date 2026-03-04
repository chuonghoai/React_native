import type { ApiResponse } from "@/src/models/api.model";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  VerifyChangeEmailRequest,
} from "@/src/models/user.model";
import { ENDPOINTS } from "@/src/services/api/endpoints";
import { http } from "@/src/services/api/http";

export const userService = {
  updateProfile(payload: UpdateProfileRequest) {
    return http.post<ApiResponse>(ENDPOINTS.UPDATE_PROFILE, payload);
  },

  uploadAvatar(formData: FormData) {
    return http.upload<ApiResponse<string>>(ENDPOINTS.UPLOAD_AVATAR, formData);
  },

  changePassword(payload: ChangePasswordRequest) {
    return http.post<ApiResponse>(ENDPOINTS.CHANGE_PASSWORD, payload);
  },

  requestChangeEmail(email: string) {
    return http.post<ApiResponse>(ENDPOINTS.REQUEST_CHANGE_EMAIL, { email });
  },

  verifyChangeEmail(payload: VerifyChangeEmailRequest) {
    return http.post<ApiResponse>(ENDPOINTS.VERIFY_CHANGE_EMAIL, payload);
  },
};