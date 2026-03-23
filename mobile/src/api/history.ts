import apiClient from "./client";

export type SessionHistoryEntry = {
  session_id: number;
  scenario_title: string;
  difficulty: string;
  completed_at: string;
  outcome: string | null;
  total_score: number | null;
  is_public_replay: boolean;
};

type SessionHistoryResponse = {
  entries: SessionHistoryEntry[];
};

export async function getSessionHistory(): Promise<SessionHistoryEntry[]> {
  const res = await apiClient.get<SessionHistoryResponse>("/profile/history");
  return res.data.entries;
}

type UpdateVisibilityResponse = {
  session_id: number;
  is_public_replay: boolean;
};

export async function updateSessionVisibility(
  sessionId: number,
  isPublic: boolean
): Promise<UpdateVisibilityResponse> {
  const res = await apiClient.patch<UpdateVisibilityResponse>(
    `/sessions/${sessionId}/visibility`,
    { is_public_replay: isPublic }
  );
  return res.data;
}
