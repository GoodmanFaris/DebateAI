import { useLocalSearchParams } from "expo-router";
import ScenarioIntroScreen from "@/src/features/scenario/screens/ScenarioIntroScreen";

export default function ScenarioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ScenarioIntroScreen scenarioId={Number(id)} />;
}
