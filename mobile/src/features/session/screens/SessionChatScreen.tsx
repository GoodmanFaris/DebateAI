import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { sendMessage, finishSession } from "../../../api/sessions";

type ChatMessage = {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
};

export default function SessionChatScreen({
  sessionId,
  title,
  openingContext,
  maxTurns,
}: {
  sessionId: number;
  title: string;
  openingContext: string;
  maxTurns: number;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (openingContext) {
      return [{ id: "opening", role: "system", content: openingContext }];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finishing, setFinishing] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || finished) return;

    setSending(true);
    setInput("");

    const tempId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: text },
    ]);

    try {
      const res = await sendMessage(sessionId, text);
      setTurnCount(res.turn_count);

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        return [
          ...withoutTemp,
          {
            id: String(res.user_message.id),
            role: "user",
            content: res.user_message.content,
          },
          {
            id: String(res.ai_message.id),
            role: "ai",
            content: res.ai_message.content,
          },
        ];
      });

      if (res.is_last_turn) {
        setFinished(true);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      Alert.alert("Error", "Could not send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleFinish() {
    setFinishing(true);
    try {
      const result = await finishSession(sessionId);
      router.replace(`/session/result/${result.id}`);
    } catch {
      Alert.alert("Error", "Could not finish session. Please try again.");
      setFinishing(false);
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === "user";
    const isSystem = item.role === "system";

    return (
      <View
        style={[
          styles.messageBubble,
          isSystem
            ? styles.systemBubble
            : isUser
              ? styles.userBubble
              : styles.aiBubble,
        ]}
      >
        {isSystem ? (
          <Text style={styles.systemLabel}>Context</Text>
        ) : (
          <Text style={[styles.roleLabel, isUser && styles.userRoleLabel]}>
            {isUser ? "You" : "AI"}
          </Text>
        )}
        <Text
          style={[
            styles.messageText,
            isUser && styles.userText,
            isSystem && styles.systemText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title || `Session #${sessionId}`}
        </Text>
        <Text style={styles.turnInfo}>
          Turn {turnCount}/{maxTurns}
        </Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        style={styles.list}
      />

      {finished ? (
        <View style={styles.finishedBar}>
          <Text style={styles.finishedText}>
            All turns used. Finish the session to get your results.
          </Text>
        </View>
      ) : null}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={finished ? "Session complete" : "Type your message..."}
          editable={!sending && !finished}
          multiline
          maxLength={1000}
        />
        {!finished ? (
          <Pressable
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </Pressable>
        ) : null}
      </View>

      <Pressable
        style={[styles.finishButton, finishing && styles.finishButtonDisabled]}
        onPress={handleFinish}
        disabled={finishing}
      >
        {finishing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.finishButtonText}>Finish Session</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 12,
  },
  turnInfo: {
    fontSize: 14,
    color: "#666",
  },
  list: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
  },
  userBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  systemBubble: {
    backgroundColor: "#FFF8E1",
    alignSelf: "center",
    maxWidth: "95%",
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    color: "#999",
  },
  userRoleLabel: {
    color: "rgba(255,255,255,0.7)",
  },
  userText: {
    color: "#fff",
  },
  systemLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    color: "#F57F17",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#333",
  },
  systemText: {
    color: "#555",
    fontStyle: "italic",
  },
  finishedBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E8F5E9",
  },
  finishedText: {
    fontSize: 13,
    color: "#2E7D32",
    textAlign: "center",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  finishButton: {
    marginHorizontal: 12,
    marginBottom: 32,
    marginTop: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
