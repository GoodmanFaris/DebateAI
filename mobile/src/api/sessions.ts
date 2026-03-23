import apiClient from "./client";

export type StartSessionResponse = {
  session_id: number;
  scenario_slug: string;
  opening_context: string;
  max_turns: number;
};

export type MessageData = {
  id: number;
  role: string;
  content: string;
  turn_index: number;
  created_at: string;
};

export type SendMessageResponse = {
  user_message: MessageData;
  ai_message: MessageData;
  turn_count: number;
  is_last_turn: boolean;
};

export async function startSession(
  scenarioId: number,
  dailyChallengeId?: number
): Promise<StartSessionResponse> {
  const res = await apiClient.post<StartSessionResponse>("/sessions/start", {
    scenario_id: scenarioId,
    daily_challenge_id: dailyChallengeId ?? null,
  });
  return res.data;
}

export async function sendMessage(
  sessionId: number,
  content: string
): Promise<SendMessageResponse> {
  const res = await apiClient.post<SendMessageResponse>(
    `/sessions/${sessionId}/message`,
    { content }
  );
  return res.data;
}

export type ScoreData = {
  persuasion_score: number;
  clarity_score: number;
  confidence_score: number;
  logic_score: number;
  objection_handling_score: number;
  total_score: number;
  outcome: string;
};

export type FeedbackData = {
  summary: string;
  pros: string;
  cons: string;
  improvement_tips: string;
};

export type FinishSessionResponse = {
  id: number;
  scenario_id: number;
  status: string;
  outcome: string | null;
  turn_count: number;
  max_turns: number;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  score: ScoreData | null;
  feedback: FeedbackData | null;
};

export async function finishSession(
  sessionId: number
): Promise<FinishSessionResponse> {
  const res = await apiClient.post<FinishSessionResponse>(
    `/sessions/${sessionId}/finish`
  );
  return res.data;
}

export type SessionResultResponse = {
  session_id: number;
  scenario_title: string;
  difficulty: string;
  outcome: string | null;
  total_score: number | null;
  summary: string | null;
  pros: string | null;
  cons: string | null;
  improvement_tips: string | null;
};

export async function getSessionResult(
  sessionId: number
): Promise<SessionResultResponse> {
  const res = await apiClient.get<SessionResultResponse>(
    `/sessions/${sessionId}/result`
  );
  return res.data;
}

export type KeyMoment = {
  moment: string;
  impact: string;
  explanation: string;
};

export type BetterResponse = {
  original: string;
  suggested: string;
  why: string;
};

export type CoachAnalysis = {
  overall_analysis: string;
  tone_analysis: string;
  opponent_analysis: string;
  key_moments: KeyMoment[];
  better_responses: BetterResponse[];
  winning_move: string;
};

export async function getCoachAnalysis(
  sessionId: number
): Promise<CoachAnalysis> {
  const res = await apiClient.get<CoachAnalysis>(
    `/sessions/${sessionId}/coach`
  );
  return res.data;
}
