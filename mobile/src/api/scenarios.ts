import apiClient from "./client";

export type ScenarioDetail = {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  difficulty: string;
  goal: string;
  user_role: string;
  ai_role: string;
  opening_context: string;
  rules: string | null;
  max_turns: number;
  is_premium: boolean;
  image_url: string | null;
};

export async function getScenario(scenarioId: number): Promise<ScenarioDetail> {
  const res = await apiClient.get<ScenarioDetail>(`/scenarios/${scenarioId}`);
  return res.data;
}
