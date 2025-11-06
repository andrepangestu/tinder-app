import { Tabs } from "expo-router";
import { Image } from "react-native";

import { HapticTab } from "@/src/components/molecules";
import { Colors } from "@/src/constants/theme";
import { useColorScheme } from "@/src/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/tinder-icon.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Liked",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/star.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
