// DashboardScreen.tsx

import { supabase } from "@/src/core/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ------------------------------------------------------------------ */
/* THEME */
/* ------------------------------------------------------------------ */

const COLORS = {
  primary: "#2563eb",
  success: "#16a34a",

  bg: "#f1f5f9",
  card: "#ffffff",

  text: "#0f172a",
  muted: "#64748b",
  gray: "#94a3b8",
  border: "#e2e8f0",

  danger: "#ef4444",
};

/* ------------------------------------------------------------------ */
/* ROUTES */
/* ------------------------------------------------------------------ */

const ROUTES = {
  CREATE_BILL: "/create-bill",
  SERVICE_HISTORY: "/service-history",
  INVENTORY: "/inventory",
  TOTAL_BILLS: "/total-bills",
} as const;

type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/* ------------------------------------------------------------------ */
/* DASHBOARD CARDS */
/* ------------------------------------------------------------------ */

const dashboardCards: {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  route: AppRoute;
  color: string;
}[] = [
  {
    title: "Create New Bill",
    description: "Generate service invoice",
    icon: "plus-circle",
    route: ROUTES.CREATE_BILL,
    color: COLORS.primary,
  },
  {
    title: "Service History",
    description: "View past records",
    icon: "folder",
    route: ROUTES.SERVICE_HISTORY,
    color: COLORS.success,
  },
  {
    title: "Inventory",
    description: "Manage stock items",
    icon: "box",
    route: ROUTES.INVENTORY,
    color: "#7c3aed",
  },
  {
    title: "Total Bills",
    description: "Billing analytics & reports",
    icon: "file-text",
    route: ROUTES.TOTAL_BILLS,
    color: "#d97706",
  },
];

/* ------------------------------------------------------------------ */
/* SCREEN */
/* ------------------------------------------------------------------ */

export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    todayBills: 0,
    todayRevenue: 0,
    monthBills: 0,
  });

  /* ---------------- LOAD STATS ---------------- */

  const loadStats = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase.rpc("get_dashboard_stats");
      if (error) throw error;

      if (data) {
        setStats({
          todayBills: data.today_bill_count ?? 0,
          todayRevenue: data.today_revenue ?? 0,
          monthBills: data.month_bill_count ?? 0,
        });
      }
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  /* ---------------- DISABLE BACK ---------------- */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => sub.remove();
    }, [])
  );

  /* ---------------- NAVIGATION ---------------- */

  const navigateTo = (route: AppRoute) => {
    try {
      router.push(route);
    } catch {
      Alert.alert("Navigation failed");
    }
  };

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadStats(true)}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Text style={styles.title}>Balwa Car Cool</Text>
        <Text style={styles.subtitle}>Business Overview</Text>
      </View>

      {/* ================= ERROR ================= */}

      {error !== "" && (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => loadStats()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* ================= STATS ================= */}

      <View style={styles.statsRow}>
        <StatCard
          label="Today Bills"
          value={loading ? "--" : stats.todayBills}
        />

        <StatCard
          label="Today's Revenue"
          value={
            loading
              ? "..."
              : `₹${stats.todayRevenue}`
          }
          highlight
        />

        <StatCard
          label="Month Bills"
          value={loading ? "--" : stats.monthBills}
        />
      </View>

      {/* ================= CARDS ================= */}

      <View style={styles.container}>
        {dashboardCards.map((card) => (
          <Pressable
            key={card.title}
            onPress={() => navigateTo(card.route)}
            android_ripple={{ color: "#e2e8f0" }}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
              <Feather name={card.icon} size={24} color="#fff" />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardText}>{card.description}</Text>
            </View>

            <Feather name="chevron-right" size={20} color={COLORS.gray} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* STAT CARD */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.highlight]}>
        {value}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingBottom: 50,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 28,
    marginBottom: 14,
  },

  title: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
    marginTop: 4,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fee2e2",
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    color: "#b91c1c",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },

  retryText: {
    color: COLORS.primary,
    fontFamily: "Poppins-SemiBold",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },

  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: COLORS.muted,
  },

  statValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginTop: 6,
    color: COLORS.text,
  },

  highlight: {
    color: COLORS.success,
  },

  container: {
    paddingHorizontal: 20,
    gap: 14,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 3,
      },
    }),
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
  },

  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.text,
  },

  cardText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
    marginTop: 4,
  },
});