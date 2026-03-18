import type { LoginRequest, RegisterRequest } from "@/src/models/auth.model";
import { UserData } from "@/src/models/user.model";
import { authService } from "@/src/services/auth.service";
import { websocketService } from "@/src/services/websocket";
import { userLocal } from "@/src/storage/user.local";
import { router } from "expo-router";
import { authStore } from "../stores/auth.store";

type ControllerResult = { ok: true } | { ok: false; message: string };

function validateRegisterInput(input: RegisterRequest): string | null {
  const username = input.username?.trim();
  const email = input.email?.trim();
  const password = input.password;

  if (!username) return "Vui lòng nhập username";

  if (!email) return "Vui lòng nhập email";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Email không hợp lệ";

  if (!password) return "Vui lòng nhập mật khẩu";

  return null;
}

function validateLoginInput(input: LoginRequest): string | null {
  const username = input.username?.trim();
  const password = input.password;

  if (!username) return "Vui lòng nhập username";
  if (!password) return "Vui lòng nhập mật khẩu";
  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const authController = {
  async register(input: RegisterRequest): Promise<ControllerResult> {
    const cleanInput: RegisterRequest = {
      username: input.username?.trim(),
      email: input.email?.trim(),
      password: input.password,
    };

    const err = validateRegisterInput(cleanInput);
    if (err) return { ok: false, message: err };

    try {
      const res = await authService.register(cleanInput);

      if (res?.success) {
        return { ok: true };
      }

      return {
        ok: false,
        message: res?.message || "Đăng ký thất bại",
      };
    } catch (e: any) {
      return {
        ok: false,
        message: e?.message || "Không thể kết nối server",
      };
    }
  },

  async login(input: LoginRequest): Promise<ControllerResult> {
    const cleanInput: LoginRequest = {
      username: input.username?.trim(),
      password: input.password,
    };

    const err = validateLoginInput(cleanInput);
    if (err) return { ok: false, message: err };
    try {
      console.log(
        "Đang đăng nhập với username: " +
          cleanInput.username +
          " - password: " +
          cleanInput.password,
      );
      const res = await authService.login(cleanInput);

      if (!res?.success) {
        return { ok: false, message: res?.message || "Đăng nhập thất bại" };
      }

      const token =
        (res as any)?.data?.token ?? (res as any)?.data?.accessToken ?? null;

      if (token) {
        await authStore.setToken(token);
        websocketService.connect(token);
      }

      router.replace("/(tabs)");
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Không thể kết nối server" };
    }
  },

  async logout(): Promise<ControllerResult> {
    try {
      websocketService.disconnect();
      await authService.logout().catch(() => null);

      await userLocal.clear();
      await authStore.clear();

      router.replace("/(auth)/login");
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Logout thất bại" };
    }
  },

  async sendForgotOtp(email: string): Promise<ControllerResult> {
    const cleanEmail = email.trim();
    if (!cleanEmail) return { ok: false, message: "Vui lòng nhập email" };
    if (!isValidEmail(cleanEmail))
      return { ok: false, message: "Email không hợp lệ" };

    try {
      const res = await authService.forgotPassword({ email: cleanEmail });

      if (!res?.success) {
        return { ok: false, message: res?.message || "Gửi OTP thất bại" };
      }

      router.push({
        pathname: "/(auth)/password-reset",
        params: { email: cleanEmail },
      });

      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Không thể kết nối server" };
    }
  },

  async resetPassword(input: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<ControllerResult> {
    const email = input.email.trim();
    const otp = input.otp.trim();
    const newPassword = input.newPassword;

    if (!email) return { ok: false, message: "Thiếu email" };
    if (!isValidEmail(email))
      return { ok: false, message: "Email không hợp lệ" };
    if (!otp) return { ok: false, message: "Vui lòng nhập OTP" };
    if (!newPassword || newPassword.length < 6) {
    }

    try {
      const res = await authService.resetPassword({
        email,
        otp,
        newPassword,
      });

      if (!res?.success) {
        return { ok: false, message: res?.message || "Đổi mật khẩu thất bại" };
      }

      router.replace("/(auth)/login");
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Không thể kết nối server" };
    }
  },

  async getMe(): Promise<{ ok: boolean; data?: UserData; message?: string }> {
    try {
      const res = await authService.getMe();
      if (res?.success && res.data) {
        return { ok: true, data: res.data };
      }
      return { ok: false, message: res?.message || "Lỗi lấy thông tin" };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Lỗi kết nối" };
    }
  },
};
