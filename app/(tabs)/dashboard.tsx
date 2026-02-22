// DashboardScreen.tsx

import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
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

  bg: "#f8fafc",
  card: "#ffffff",

  text: "#0f172a",
  muted: "#64748b",
  gray: "#94a3b8",
  border: "#e5e7eb",

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
  icon: any;
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
    description: "Manage stock",
    icon: "box",
    route: ROUTES.INVENTORY,
    color: "#7c2d12",
  },
  {
    title: "Total Bills",
    description: "Billing analytics",
    icon: "file-text",
    route: ROUTES.TOTAL_BILLS,
    color: "#ca8a04",
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

  /* ------------------------------------------------------------------ */
  /* LOAD STATS */
  /* ------------------------------------------------------------------ */

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
    } catch (err) {
      console.log("Dashboard error:", err);

      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  /* ------------------------------------------------------------------ */
  /* DISABLE BACK */
  /* ------------------------------------------------------------------ */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => sub.remove();
    }, []),
  );

  /* ------------------------------------------------------------------ */
  /* NAVIGATION */
  /* ------------------------------------------------------------------ */

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

        <Text style={styles.subtitle}>Dashboard Overview</Text>
      </View>

      {/* ================= ERROR ================= */}

      {error !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={() => loadStats()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* ================= STATS ================= */}

      <View style={styles.statsRow}>
        <StatCard
          label="Today"
          value={loading ? "--" : stats.todayBills}
          suffix="Bills"
        />

        <StatCard
          label="Revenue"
          value={
            loading
              ? "..."
              : stats.todayRevenue === 0
                ? "No Sales"
                : `₹${stats.todayRevenue}`
          }
          suffix="Today"
          highlight
        />

        <StatCard
          label="Month"
          value={loading ? "--" : stats.monthBills}
          suffix="Bills"
        />
      </View>

      {/* ================= CARDS ================= */}

      <View style={styles.container}>
        {dashboardCards.map((card) => (
          <Pressable
            key={card.title}
            onPress={() => navigateTo(card.route)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
              <Feather name={card.icon} size={26} color="#fff" />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>

              <Text style={styles.cardText}>{card.description}</Text>
            </View>

            <Feather name="chevron-right" size={22} color={COLORS.gray} />
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
  suffix,
  highlight,
}: {
  label: string;
  value: string | number;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statSmallLabel}>{label}</Text>

      <Text style={[styles.statMain, highlight && styles.revenue]}>
        {value}
      </Text>

      <Text style={styles.statSub}>{suffix}</Text>
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
    paddingBottom: 40,
  },

  /* Header */

  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
    marginTop: 2,
  },

  /* Error */

  errorBox: {
    backgroundColor: "#fee2e2",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },

  retryBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
  },

  retryText: {
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },

  /* Stats */

  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  statPill: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  statSmallLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: COLORS.muted,
  },

  statMain: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: COLORS.text,
    marginVertical: 3,
  },

  revenue: {
    color: COLORS.success,
  },

  statSub: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: COLORS.gray,
  },

  /* Cards */

  container: {
    padding: 16,
    gap: 14,
    marginTop: 10,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,

    flexDirection: "row",
    alignItems: "center",
    gap: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  cardIcon: {
    width: 52,
    height: 52,
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
    marginTop: 2,
  },
});
