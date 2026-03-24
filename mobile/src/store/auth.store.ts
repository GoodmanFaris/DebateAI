import { create } from "zustand";
import { saveToken, removeToken } from "../utils/tokenStorage";

export type User = {
  id: number;
  email: string;
  auth_provider: string;
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
};

type AuthState = {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    saveToken(token);
    set({ accessToken: token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    removeToken();
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
