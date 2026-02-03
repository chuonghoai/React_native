import type { UserData } from "@/src/models/user.model";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_DATA_KEY = "user_data";

export const userLocal = {
  async upsert(user: UserData) {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Lỗi khi lưu user local:", error);
    }
  },

  async get(): Promise<UserData | null> {
    try {
      const json = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!json) return null;
      return JSON.parse(json) as UserData;
    } catch (error) {
      console.error("Lỗi khi lấy user local:", error);
      return null;
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Lỗi khi xóa user local:", error);
    }
  },
};