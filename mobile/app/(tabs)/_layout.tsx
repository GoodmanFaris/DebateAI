import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/src/constants/colors";

const TAB_BAR_BG = "#131720";
const TAB_BAR_CONTENT_HEIGHT = 58;
const TAB_BAR_BOTTOM_MARGIN = 0;

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(
  active: IoniconName,
  inactive: IoniconName
): (props: { focused: boolean }) => React.ReactNode {
  return ({ focused }) => (
    <Ionicons
      name={focused ? active : inactive}
      size={22}
      color={focused ? colors.primaryBlue : "rgba(255,255,255,0.35)"}
    />
  );
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
          tabBarIcon: tabIcon("home", "home-outline"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: tabIcon("time", "time-outline"),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: tabIcon("trophy", "trophy-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("person", "person-outline"),
        }}
      />
    </Tabs>
  );
}
