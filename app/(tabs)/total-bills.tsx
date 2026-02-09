import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const DATE_FILTERS = [
    { label: "This Month", value: "THIS_MONTH" },
    { label: "Previous Month", value: "PREVIOUS_MONTH" },
    { label: "Last 7 Days", value: "LAST_7_DAYS" },
    { label: "Last 3 Months", value: "LAST_3_MONTHS" },
    { label: "Last 6 Months", value: "LAST_6_MONTHS" },
    { label: "This Year", value: "THIS_YEAR" },
    { label: "Custom Month", value: "CUSTOM_MONTH" },
] as const;

type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];

type DateRange = {
    start: string;
    end: string;
};

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

function SimpleBarChart({
    data,
}: {
    data: { month: string; total: number }[];
}) {
    const max = Math.max(...data.map(d => d.total), 1);

    return (
        <View style={{ marginTop: 12 }}>
            {data.map(item => (
                <View key={item.month} style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, marginBottom: 4 }}>
                        {item.month} — ₹{item.total}
                    </Text>

                    <View
                        style={{
                            height: 10,
                            backgroundColor: "#e5e7eb",
                            borderRadius: 6,
                            overflow: "hidden",
                        }}
                    >
                        <View
                            style={{
                                width: `${(item.total / max) * 100}%`,
                                height: "100%",
                                backgroundColor: "#2563eb",
                            }}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
}

export default function TotalBillsScreen() {
    const [selectedFilter, setSelectedFilter] =
        useState<DateFilterValue>("THIS_MONTH");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [totals, setTotals] = useState({ billCount: 0, revenue: 0 });
    const [loadingTotals, setLoadingTotals] = useState(true);

    const [monthlyData, setMonthlyData] = useState<
        { month: string; total: number }[]
    >([]);

    useEffect(() => {
        const loadTotals = async () => {
            setLoadingTotals(true);
            const { start, end } = getDateRange(selectedFilter);

            const { data } = await supabase
                .from("bills")
                .select("created_at, total_amount")
                .gte("created_at", start)
                .lte("created_at", end);

            if (data) {
                const revenue = data.reduce(
                    (sum, row) => sum + (row.total_amount ?? 0),
                    0
                );

                setTotals({
                    billCount: data.length,
                    revenue,
                });

                const grouped: Record<string, number> = {};
                data.forEach(row => {
                    const key = formatMonth(row.created_at);
                    grouped[key] = (grouped[key] || 0) + (row.total_amount ?? 0);
                });

                setMonthlyData(
                    Object.entries(grouped).map(([month, total]) => ({
                        month,
                        total,
                    }))
                );
            }

            setLoadingTotals(false);
        };

        loadTotals();
    }, [selectedFilter]);

    return (
        <ScrollView style={styles.screen}>
            <Text style={styles.title}>Total Bills</Text>

            {/* Dropdown */}
            <View style={styles.dropdownWrapper}>
                <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                    <Text style={styles.dropdownText}>
                        {DATE_FILTERS.find(f => f.value === selectedFilter)?.label}
                    </Text>
                    <Text style={styles.dropdownArrow}>▾</Text>
                </Pressable>

                {dropdownOpen && (
                    <View style={styles.dropdownMenu}>
                        {DATE_FILTERS.map(filter => (
                            <Pressable
                                key={filter.value}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setSelectedFilter(filter.value);
                                    setDropdownOpen(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.dropdownItemText,
                                        filter.value === selectedFilter && styles.activeItem,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>

            {/* Summary */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Bills</Text>
                    <Text style={styles.summaryValue}>
                        {loadingTotals ? "--" : totals.billCount}
                    </Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Revenue</Text>
                    <Text style={styles.summaryValue}>
                        {loadingTotals ? "--" : `₹${totals.revenue}`}
                    </Text>
                </View>
            </View>

            {/* Analytics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Revenue by Month</Text>

                {monthlyData.length === 0 ? (
                    <Text style={styles.emptyText}>No data for selected range</Text>
                ) : (
                    // <SimpleBarChart data={monthlyData} />
                    <Text style={{ color: "#94a3b8", fontSize: 14 }}>
                        (Bar chart coming soon!)
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
    },

    dropdownWrapper: {
        marginBottom: 16,
        position: "relative",
        zIndex: 10,
        alignSelf: "flex-start",
    },
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: "500",
    },
    dropdownArrow: {
        fontSize: 14,
        color: "#64748b",
    },
    dropdownMenu: {
        position: "absolute",
        top: 52,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        overflow: "hidden",
        zIndex: 20,
        elevation: 6,
        minWidth: 180,
    },
    dropdownItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    dropdownItemText: {
        fontSize: 14,
        color: "#111827",
    },
    activeItem: {
        fontWeight: "700",
        color: "#2563eb",
    },

    summaryRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
    },
    summaryLabel: {
        fontSize: 12,
        color: "#64748b",
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "700",
        marginTop: 6,
    },

    section: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptyText: {
        color: "#94a3b8",
        fontSize: 14,
    },
});
