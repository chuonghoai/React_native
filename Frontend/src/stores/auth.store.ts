import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

let _token: string | null = null;
let _hydrated = false;

export const authStore = {
  async hydrate() {
    _token = await AsyncStorage.getItem(TOKEN_KEY);
    _hydrated = true;
    return _token;
  },

  isHydrated() {
    return _hydrated;
  },

  getToken() {
    return _token;
  },

  async setToken(token: string) {
    _token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async clear() {
    _token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  isLoggedIn() {
    return !!_token;
  },
};
