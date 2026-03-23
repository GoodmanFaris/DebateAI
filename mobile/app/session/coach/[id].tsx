import { useLocalSearchParams } from "expo-router";
import CoachScreen from "@/src/features/session/screens/CoachScreen";

export default function CoachRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CoachScreen sessionId={Number(id)} />;
}
