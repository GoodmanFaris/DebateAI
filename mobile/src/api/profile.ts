import apiClient from "./client";

export type ProfileData = {
  display_name: string;
  username: string;
  avatar_url: string | null;
  region: string | null;
  level: number;
  xp: number;
  current_streak: number;
  best_streak: number;
  total_sessions: number;
  total_wins: number;
  average_score: number;
  is_premium: boolean;
};

export async function getProfile(): Promise<ProfileData> {
  const res = await apiClient.get<ProfileData>("/profile");
  return res.data;
}

export type UpdateProfileRequest = {
  display_name?: string;
  username?: string;
  region?: string;
  avatar_url?: string;
};

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ProfileData> {
  const res = await apiClient.patch<ProfileData>("/profile", data);
  return res.data;
}
