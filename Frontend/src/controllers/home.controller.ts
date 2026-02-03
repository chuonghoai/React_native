import type { UserData } from "@/src/models/user.model";
import { authService } from "@/src/services/auth.service";
import { userLocal } from "@/src/storage/user.local";

export type LoadMeResult =
  | { ok: true; data: UserData }
  | { ok: false; message: string };

export const homeController = {
  async loadMe(): Promise<LoadMeResult> {
    try {
      const res = await authService.getMe();

      if (!res?.success || !res.data) {
        return { ok: false, message: res?.message || "Không lấy được thông tin user" };
      }

      const user = res.data as UserData;

      await userLocal.upsert(user);

      return { ok: true, data: user };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Không thể kết nối server" };
    }
  },
};
