import { useLocalSearchParams } from "expo-router";
import ReplayDetailScreen from "@/src/features/leaderboard/screens/ReplayDetailScreen";

export default function ReplayDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ReplayDetailScreen sessionId={Number(id)} />;
}
