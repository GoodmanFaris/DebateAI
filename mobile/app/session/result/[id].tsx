import { useLocalSearchParams } from "expo-router";
import SessionResultScreen from "@/src/features/session/screens/SessionResultScreen";

export default function SessionResultRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <SessionResultScreen sessionId={Number(id)} />;
}
