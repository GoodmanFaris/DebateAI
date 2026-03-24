import { useLocalSearchParams } from "expo-router";
import ScenarioIntroScreen from "@/src/features/scenario/screens/ScenarioIntroScreen";

export default function ScenarioRoute() {
  const { id, dailyChallengeId } = useLocalSearchParams<{
    id: string;
    dailyChallengeId?: string;
  }>();

  return (
    <ScenarioIntroScreen
      scenarioId={Number(id)}
      dailyChallengeId={dailyChallengeId ? Number(dailyChallengeId) : undefined}
    />
  );
}
