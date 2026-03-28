import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTutorialStore } from "@/src/store/tutorial.store";
import { TUTORIAL_TAB_HIGHLIGHT } from "@/src/constants/tutorialSteps";
import colors from "@/src/constants/colors";

const TAB_BAR_BG = "#131720";
const TAB_BAR_CONTENT_HEIGHT = 58;
const TAB_BAR_BOTTOM_MARGIN = 0;

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(
  active: IoniconName,
  inactive: IoniconName,
  tabName: string
): (props: { focused: boolean }) => React.ReactNode {
  return ({ focused }) => {
    const tutorialActive = useTutorialStore((s) => s.tutorialActive);
    const tutorialStep = useTutorialStore((s) => s.tutorialStep);
    const highlightedTab = tutorialActive
      ? TUTORIAL_TAB_HIGHLIGHT[tutorialStep]
      : undefined;
    const isHighlighted = highlightedTab === tabName;

    return (
      <View style={isHighlighted ? styles.highlightWrap : undefined}>
        <Ionicons
          name={focused ? active : inactive}
          size={22}
          color={
            isHighlighted
              ? colors.primaryBlue
              : focused
                ? colors.primaryBlue
                : "rgba(255,255,255,0.35)"
          }
        />
        {isHighlighted && <View style={styles.highlightDot} />}
      </View>
    );
  };
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.07)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: tabBarHeight,
          paddingBottom: bottomInset + 6,
          paddingTop: 8,
          position: "absolute",
          bottom: TAB_BAR_BOTTOM_MARGIN,
          left: 6,
          right: 6,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primaryBlue,
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: tabIcon("home", "home-outline", "index"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: tabIcon("time", "time-outline", "history"),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: tabIcon("trophy", "trophy-outline", "leaderboard"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("person", "person-outline", "profile"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  highlightWrap: {
    alignItems: "center",
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBlue,
    marginTop: 3,
  },
});
