import { useLocalSearchParams } from "expo-router";
import SessionChatScreen from "@/src/features/session/screens/SessionChatScreen";

export default function SessionRoute() {
  const { id, title, openingContext, maxTurns } = useLocalSearchParams<{
    id: string;
    title: string;
    openingContext: string;
    maxTurns: string;
  }>();

  return (
    <SessionChatScreen
      sessionId={Number(id)}
      title={title ?? ""}
      openingContext={openingContext ?? ""}
      maxTurns={Number(maxTurns) || 10}
    />
  );
}
