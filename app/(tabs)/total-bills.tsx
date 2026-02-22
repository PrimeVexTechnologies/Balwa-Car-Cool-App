import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/* ------------------------------------------------------------------ */
/* DATE FILTERS */
/* ------------------------------------------------------------------ */

const DATE_FILTERS = [
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Previous Month", value: "PREVIOUS_MONTH" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 3 Months", value: "LAST_3_MONTHS" },
  { label: "Last 6 Months", value: "LAST_6_MONTHS" },
  { label: "This Year", value: "THIS_YEAR" },
] as const;

type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];

type DateRange = {
  start: string;
  end: string;
};

/* ------------------------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------------------------ */

function getDateRange(filter: DateFilterValue): DateRange {
  const now = new Date();

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  let start: Date;
  let end: Date;

  switch (filter) {
    case "THIS_MONTH":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = endOfDay(now);
      break;

    case "PREVIOUS_MONTH":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      break;

    case "LAST_7_DAYS":
      start = startOfDay(new Date(now.getTime() - 6 * 86400000));
      end = endOfDay(now);
      break;

    case "LAST_3_MONTHS":
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      end = endOfDay(now);
      break;

    case "LAST_6_MONTHS":
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      end = endOfDay(now);
      break;

    case "THIS_YEAR":
      start = new Date(now.getFullYear(), 0, 1);
      end = endOfDay(now);
      break;

    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = endOfDay(now);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function formatMonth(date: string) {
  return new Date(date).toLocaleString("default", { month: "short" });
}

/* ------------------------------------------------------------------ */
/* SCREEN */
/* ------------------------------------------------------------------ */

export default function TotalBillsScreen() {
  const [selectedFilter, setSelectedFilter] =
    useState<DateFilterValue>("THIS_MONTH");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({
    billCount: 0,
    revenue: 0,
  });

  const [monthlyData, setMonthlyData] = useState<
    { month: string; total: number }[]
  >([]);

  /* ------------------------------------------------------------------ */
  /* LOAD DATA */
  /* ------------------------------------------------------------------ */

  const loadTotals = useCallback(async () => {
    try {
      setLoading(true);

      const { start, end } = getDateRange(selectedFilter);

      const { data, error } = await supabase
        .from("bills")
        .select("created_at, total_amount")
        .gte("created_at", start)
        .lte("created_at", end);

      if (error) {
        console.log("Totals error:", error);
        return;
      }

      if (!data) return;

      const revenue = data.reduce(
        (sum, row) => sum + (row.total_amount ?? 0),
        0,
      );

      setTotals({
        billCount: data.length,
        revenue,
      });

      const grouped: Record<string, number> = {};

      data.forEach((row) => {
        const key = formatMonth(row.created_at);

        grouped[key] = (grouped[key] || 0) + (row.total_amount ?? 0);
      });

      setMonthlyData(
        Object.entries(grouped).map(([month, total]) => ({
          month,
          total,
        })),
      );
    } catch (err) {
      console.log("Load totals failed:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadTotals();
  }, [loadTotals]);

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Text style={styles.title}>Total Bills</Text>
        <Text style={styles.subtitle}>Billing analytics & revenue</Text>
      </View>

      {/* ================= FILTER ================= */}

      <View style={styles.dropdownWrapper}>
        <Pressable
          style={styles.dropdownTrigger}
          onPress={() => setDropdownOpen((p) => !p)}
        >
          <Text style={styles.dropdownText}>
            {DATE_FILTERS.find((f) => f.value === selectedFilter)?.label}
          </Text>

          <Text style={styles.arrow}>▾</Text>
        </Pressable>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {DATE_FILTERS.map((f) => {
              const active = f.value === selectedFilter;

              return (
                <Pressable
                  key={f.value}
                  style={[styles.dropdownItem, active && styles.activeItemBg]}
                  onPress={() => {
                    setSelectedFilter(f.value);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      active && styles.activeItemText,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* ================= SUMMARY ================= */}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Bills</Text>

          <Text style={styles.summaryValue}>
            {loading ? "..." : totals.billCount}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Revenue</Text>

          <Text style={[styles.summaryValue, styles.revenue]}>
            {loading ? "..." : `₹${totals.revenue}`}
          </Text>
        </View>
      </View>

      {/* ================= ANALYTICS ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue by Month</Text>

        {monthlyData.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No analytics available for this range
            </Text>
          </View>
        ) : (
          monthlyData.map((m) => (
            <View key={m.month} style={styles.monthRow}>
              <Text style={styles.monthText}>{m.month}</Text>

              <Text style={styles.monthValue}>₹{m.total}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
  },

  /* Header */

  header: {
    paddingTop: 24,
    marginBottom: 14,
  },

  title: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: "#0f172a",
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
    marginTop: 2,
  },

  /* Dropdown */

  dropdownWrapper: {
    marginBottom: 16,
    position: "relative",
    alignSelf: "flex-start",
  },

  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  dropdownText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0f172a",
  },

  arrow: {
    color: "#64748b",
  },

  dropdownMenu: {
    position: "absolute",
    top: 54,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    elevation: 8,
    minWidth: 200,
    zIndex: 20,
  },

  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  dropdownItemText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#111827",
  },

  activeItemBg: {
    backgroundColor: "#eff6ff",
  },

  activeItemText: {
    color: "#2563eb",
    fontFamily: "Poppins-SemiBold",
  },

  /* Summary */

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 2,
  },

  summaryLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#64748b",
  },

  summaryValue: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    marginTop: 4,
    color: "#0f172a",
  },

  revenue: {
    color: "#16a34a",
  },

  /* Section */

  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 10,
    color: "#0f172a",
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },

  monthText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#334155",
  },

  monthValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#0f172a",
  },

  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
});
