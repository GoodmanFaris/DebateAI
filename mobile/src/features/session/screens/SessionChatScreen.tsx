import { useEffect, useRef, useState } from "react";
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
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { sendMessage, finishSession } from "../../../api/sessions";
import colors from "../../../constants/colors";

type ChatMessage = {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
};

// Animated typing dots shown while waiting for AI
function TypingIndicator() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay((dots.length - i) * 180),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
      <View style={styles.aiBubble}>
        <Text style={styles.roleLabel}>AI</Text>
        <View style={styles.typingDots}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                opacity: dot,
                transform: [
                  {
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
        </View>
      </View>
    </View>
  );
}

function MessageBubble({ item }: { item: ChatMessage }) {
  const isUser = item.role === "user";
  const isSystem = item.role === "system";

  if (isSystem) {
    return (
      <View style={styles.systemBubble}>
        <Text style={styles.systemLabel}>Context</Text>
        <Text style={styles.systemText}>{item.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.roleLabel, isUser && styles.userRoleLabel]}>
          {isUser ? "You" : "AI"}
        </Text>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
      </View>
    </View>
  );
}

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
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList>(null);

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

  function scrollToBottom() {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || finished) return;

    setSending(true);
    setInput("");

    const tempId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);
    scrollToBottom();

    try {
      const res = await sendMessage(sessionId, text);
      setTurnCount(res.turn_count);

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        return [
          ...withoutTemp,
          { id: String(res.user_message.id), role: "user", content: res.user_message.content },
          { id: String(res.ai_message.id), role: "ai", content: res.ai_message.content },
        ];
      });

      if (res.is_last_turn) setFinished(true);
      scrollToBottom();
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
      queryClient.invalidateQueries({ queryKey: ["dailyChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      router.replace(`/session/result/${result.id}`);
    } catch {
      Alert.alert("Error", "Could not finish session. Please try again.");
      setFinishing(false);
    }
  }

  function confirmFinish() {
    Alert.alert(
      "Finish Session",
      "Are you sure you want to finish? You'll get your results and feedback.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Finish", style: "destructive", onPress: handleFinish },
      ]
    );
  }

  const turnsLeft = maxTurns - turnCount;
  const turnsLow = turnsLeft <= 2 && !finished;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(74, 144, 217, 0.15)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
        style={styles.topLeftGlow}
      />
      <LinearGradient
        colors={["rgba(231, 76, 60, 0.15)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
        style={styles.topRightGlow}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerAIBadge}>
          <Ionicons name="hardware-chip-outline" size={14} color={colors.primaryBlue} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || `Session #${sessionId}`}
        </Text>
        <View style={[styles.turnBadge, turnsLow && styles.turnBadgeLow]}>
          <Text style={[styles.turnText, turnsLow && styles.turnTextLow]}>
            {turnCount}/{maxTurns}
          </Text>
        </View>

        <Pressable
          style={[styles.finishHeaderButton, finishing && styles.finishHeaderButtonDisabled]}
          onPress={confirmFinish}
          disabled={finishing || finished}
        >
          {finishing ? (
            <ActivityIndicator size="small" color={colors.primaryRed} />
          ) : (
            <Text style={styles.finishHeaderText}>Finish</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={({ item }) => <MessageBubble item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          style={styles.list}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={
            sending ? (
              <View style={styles.typingFooter}>
                <TypingIndicator />
              </View>
            ) : null
          }
        />

        {/* Finished banner */}
        {finished && (
          <View style={styles.finishedBanner}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#34C759" />
            <Text style={styles.finishedText}>
              All turns complete — finish to see your results
            </Text>
          </View>
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: insets.bottom + 8 },
          ]}
        >
          {!finished ? (
            <>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Your argument..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                editable={!sending}
                multiline
                maxLength={1000}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  (!input.trim() || sending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim() || sending}
              >
                <Ionicons name="arrow-up" size={18} color="#fff" />
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.finishButton, finishing && styles.finishButtonDisabled]}
              onPress={handleFinish}
              disabled={finishing}
            >
              {finishing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="flag-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.finishButtonText}>Finish Session</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  topLeftGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "70%",
    height: 220,
  },
  topRightGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "70%",
    height: 220,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 10,
  },
  headerAIBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(74,144,217,0.15)",
    borderWidth: 1,
    borderColor: "rgba(74,144,217,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  turnBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  turnBadgeLow: {
    backgroundColor: "rgba(231,76,60,0.12)",
    borderColor: colors.primaryRed,
  },
  turnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
  },
  turnTextLow: {
    color: colors.primaryRed,
  },
  finishHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.4)",
    backgroundColor: "rgba(231,76,60,0.1)",
  },
  finishHeaderButtonDisabled: {
    opacity: 0.4,
  },
  finishHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryRed,
  },

  // Messages
  list: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowAI: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.primaryBlue,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userRoleLabel: {
    color: "rgba(255,255,255,0.6)",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.85)",
  },
  userMessageText: {
    color: "#fff",
  },
  systemBubble: {
    backgroundColor: "rgba(255,200,50,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,200,50,0.2)",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 8,
  },
  systemLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,200,50,0.7)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  systemText: {
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.55)",
    fontStyle: "italic",
  },

  // Typing indicator
  typingFooter: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
    paddingVertical: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  // Finished banner
  finishedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "rgba(52,199,89,0.08)",
    borderTopWidth: 1,
    borderTopColor: "rgba(52,199,89,0.15)",
  },
  finishedText: {
    fontSize: 13,
    color: "rgba(52,199,89,0.8)",
    fontWeight: "500",
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    gap: 8,
    backgroundColor: colors.backgroundPrimary,
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 110,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },

  // Finish button (replaces input bar when finished)
  finishButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryRed,
    borderRadius: 14,
    paddingVertical: 14,
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
