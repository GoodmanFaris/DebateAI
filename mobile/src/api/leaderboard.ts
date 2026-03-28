import apiClient from "./client";

export type LeaderboardEntry = {
  rank: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
};

export type LeaderboardType = "daily" | "weekly" | "global" | "local";

export async function getLeaderboard(
  type: LeaderboardType
): Promise<LeaderboardEntry[]> {
  const res = await apiClient.get<{ entries: LeaderboardEntry[] }>(
    `/leaderboard/${type}`
  );
  return res.data.entries;
}

export type DailySlot = {
  difficulty: string;
  scenario_title: string;
  session_id: number | null;
  total_score: number | null;
  outcome: string | null;
  is_public_replay: boolean;
  completed: boolean;
};

export type UserDailyReplays = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  slots: DailySlot[];
};

export async function getUserDailyReplays(
  username: string
): Promise<UserDailyReplays> {
  const res = await apiClient.get<UserDailyReplays>(
    `/leaderboard/daily/${username}/replays`
  );
  return res.data;
}

export type ReplayMessage = {
  role: string;
  content: string;
  turn_index: number;
  created_at: string;
};

export type PublicReplay = {
  session_id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  scenario_title: string;
  difficulty: string;
  outcome: string | null;
  total_score: number | null;
  messages: ReplayMessage[];
};

export async function getPublicReplay(
  sessionId: number
): Promise<PublicReplay> {
  const res = await apiClient.get<PublicReplay>(
    `/sessions/${sessionId}/public-replay`
  );
  return res.data;
}
