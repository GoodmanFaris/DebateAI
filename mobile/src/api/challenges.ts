import apiClient from "./client";

export type ChallengeScenario = {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  category: string;
  difficulty: string;
  is_premium: boolean;
  image_url: string | null;
};

export type DailyChallengeResponse = {
  id: number;
  challenge_date: string;
  easy: ChallengeScenario;
  medium: ChallengeScenario;
  hard: ChallengeScenario;
};

export async function getDailyChallenges(): Promise<DailyChallengeResponse> {
  const res = await apiClient.get<DailyChallengeResponse>("/daily");
  return res.data;
}
