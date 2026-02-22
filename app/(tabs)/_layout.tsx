// layout.tsx

import { Feather } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Platform, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ------------------------------------------------------------------ */
/* THEME */
/* ------------------------------------------------------------------ */

const COLORS = {
  bg: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e5e7eb",
  danger: "#ef4444",
  pressed: "#f1f5f9",
};

/* ------------------------------------------------------------------ */
/* LAYOUT */
/* ------------------------------------------------------------------ */

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  /* ---------------- CHECK CURRENT SCREEN ---------------- */

  const isDashboard = pathname === "/(tabs)/dashboard";

  /* ---------------- BACK ---------------- */

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },

        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // TODO: Replace with real auth logout later
            console.log("User logged out");

            router.replace("/login");
          },
        },
      ],
      { cancelable: true },
    );
  };

  /* ---------------- HEADER LEFT ---------------- */

  const renderBackButton = () => {
    if (isDashboard) return null;

    return (
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [styles.iconWrapper, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={22} color={COLORS.text} />
      </Pressable>
    );
  };

  /* ---------------- HEADER RIGHT ---------------- */

  const renderLogoutButton = () => {
    if (!isDashboard) return null;

    return (
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [styles.iconWrapper, pressed && styles.pressed]}
      >
        <Feather name="log-out" size={22} color={COLORS.danger} />
      </Pressable>
    );
  };

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Status Bar */}
      <StatusBar style="dark" backgroundColor={COLORS.bg} />

      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",

          /* Header */

          headerStyle: styles.header,
          headerShadowVisible: false,

          /* Title */

          headerTitleStyle: styles.headerTitle,

          /* Buttons */

          headerLeft: renderBackButton,
          headerRight: renderLogoutButton,

          /* Animations */

          animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
        }}
      >
        <Stack.Screen name="dashboard" options={{ headerTitle: "Dashboard" }} />

        <Stack.Screen name="inventory" options={{ headerTitle: "Inventory" }} />

        <Stack.Screen
          name="service-history"
          options={{ headerTitle: "Service History" }}
        />

        <Stack.Screen
          name="total-bills"
          options={{ headerTitle: "Total Bills" }}
        />
      </Stack>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* Header */

  header: {
    backgroundColor: COLORS.bg,

    borderBottomWidth: 0.6,
    borderBottomColor: COLORS.border,

    elevation: 0,

    shadowColor: "transparent",
  },

  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: 0.4,
  },

  /* Icons */

  iconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    marginHorizontal: 8,
  },

  pressed: {
    backgroundColor: COLORS.pressed,
    transform: [{ scale: 0.96 }],
  },
});
