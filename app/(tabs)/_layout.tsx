import { Stack, useRouter, usePathname } from "expo-router";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerLeft: () =>
          isDashboard ? null : (
            <Pressable onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} />
            </Pressable>
          ),
        headerRight: () =>
          isDashboard ? (
            <Pressable onPress={() => console.log("Logout clicked")}>
              <Feather name="log-out" size={22} />
            </Pressable>
          ) : null,
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ headerTitle: "Dashboard" }}
      />

      <Stack.Screen
        name="create-bill"
        options={{ headerTitle: "Create Bill" }}
      />

      <Stack.Screen
        name="service-history"
        options={{ headerTitle: "Service History" }}
      />
    </Stack>
  );
}
