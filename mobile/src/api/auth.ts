import apiClient from "./client";

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  email: string;
  password: string;
  display_name: string;
  username: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type MeResponse = {
  id: number;
  email: string;
  auth_provider: string;
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
};

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/auth/login", data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/auth/register", data);
  return res.data;
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await apiClient.get<MeResponse>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function googleAuth(idToken: string): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/auth/google", {
    id_token: idToken,
  });
  return res.data;
}
