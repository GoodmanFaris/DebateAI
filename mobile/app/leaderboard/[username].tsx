import { useLocalSearchParams } from "expo-router";
import UserDailyReplaysScreen from "@/src/features/leaderboard/screens/UserDailyReplaysScreen";

export default function UserDailyReplaysRoute() {
  const { username, displayName } = useLocalSearchParams<{
    username: string;
    displayName: string;
  }>();

  return (
    <UserDailyReplaysScreen
      username={username ?? ""}
      displayName={displayName ?? ""}
    />
  );
}
