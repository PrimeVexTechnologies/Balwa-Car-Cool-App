// layout.tsx

import { Feather } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ------------------------------------------------------------------ */
/* THEME */
/* ------------------------------------------------------------------ */

const COLORS = {
  bg: "#ffffff",
  headerBg: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#f1f5f9",
  danger: "#ef4444",
  pressed: "#f8fafc",
};

/* ------------------------------------------------------------------ */
/* LAYOUT */
/* ------------------------------------------------------------------ */

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname === "/(tabs)/dashboard";

  /* ---------------- BACK ---------------- */

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/login");
        },
      },
    ]);
  };

  /* ---------------- HEADER LEFT ---------------- */

  const renderBackButton = () => {
    if (isDashboard) return <View style={{ width: 40 }} />;

    return (
      <Pressable
        onPress={handleBack}
        android_ripple={{ color: "#e2e8f0", borderless: true }}
        style={({ pressed }) => [
          styles.iconWrapper,
          pressed && styles.iconPressed,
        ]}
      >
        <Feather name="arrow-left" size={20} color={COLORS.text} />
      </Pressable>
    );
  };

  /* ---------------- HEADER RIGHT ---------------- */

  const renderLogoutButton = () => {
    if (!isDashboard) return <View style={{ width: 40 }} />;

    return (
      <Pressable
        onPress={handleLogout}
        android_ripple={{ color: "#fee2e2", borderless: true }}
        style={({ pressed }) => [
          styles.iconWrapper,
          pressed && styles.iconPressed,
        ]}
      >
        <Feather name="log-out" size={20} color={COLORS.danger} />
      </Pressable>
    );
  };

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={COLORS.headerBg} />

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

          /* Animation */

          animation:
            Platform.OS === "ios" ? "slide_from_right" : "fade",
        }}
      >
        <Stack.Screen
          name="dashboard"
          options={{ headerTitle: "Dashboard" }}
        />

        <Stack.Screen
          name="inventory"
          options={{ headerTitle: "Inventory" }}
        />

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
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 8,

    /* Premium subtle shadow */

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 1,
      },
    }),
  },

  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    color: COLORS.text,
    letterSpacing: 0.3,
  },

  /* Icons */

  iconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  iconPressed: {
    backgroundColor: COLORS.pressed,
    transform: [{ scale: 0.96 }],
  },
});