import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserData,
  VerifyChangeEmailRequest,
} from "@/src/models/user.model";
import { userService } from "@/src/services/user.service";
import { userLocal } from "@/src/storage/user.local";

type ControllerResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export const userController = {
  async updateProfile(input: UpdateProfileRequest): Promise<ControllerResult> {
    try {
      const res = await userService.updateProfile(input);
      if (!res.success) {
        return { ok: false, message: res.message };
      }

      const currentUser = await userLocal.get();
      if (currentUser) {
        const newUser: UserData = {
          ...currentUser,
          fullname: input.fullname ?? currentUser.fullname,
          phone: input.phone ?? currentUser.phone,
          avatarUrl: input.avatarUrl ?? currentUser.avatarUrl,
        };
        await userLocal.upsert(newUser);
      }

      return { ok: true, message: "Cập nhật thành công" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async changePassword(input: ChangePasswordRequest): Promise<ControllerResult> {
    if (!input.oldPassword || !input.newPassword) {
      return { ok: false, message: "Vui lòng nhập đủ thông tin" };
    }
    try {
      const res = await userService.changePassword(input);
      if (!res.success) return { ok: false, message: res.message };
      return { ok: true, message: "Đổi mật khẩu thành công" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async requestChangeEmail(newEmail: string): Promise<ControllerResult> {
    if (!newEmail.includes("@")) return { ok: false, message: "Email không hợp lệ" };
    try {
      const res = await userService.requestChangeEmail(newEmail);
      if (!res.success) return { ok: false, message: res.message };
      return { ok: true, message: res.message };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async verifyChangeEmail(input: VerifyChangeEmailRequest): Promise<ControllerResult> {
    try {
      const res = await userService.verifyChangeEmail(input);
      if (!res.success) return { ok: false, message: res.message };

      const currentUser = await userLocal.get();
      if (currentUser) {
        await userLocal.upsert({ ...currentUser, email: input.newEmail });
      }

      return { ok: true, message: "Đổi email thành công" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },
};