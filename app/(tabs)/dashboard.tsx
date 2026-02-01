import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ROUTES = {
    CREATE_BILL: "/create-bill",
    SERVICE_HISTORY: "/service-history",
    LOGIN: "/login",
} as const;

const dashboardCards = [
    {
        title: "Create New Bill",
        description: "Generate a new service invoice",
        icon: "plus-circle",
        route: ROUTES.CREATE_BILL,
        color: "#2563eb",
        disabled: false,
    },
    {
        title: "Service History",
        description: "View past bills and invoices",
        icon: "folder",
        route: ROUTES.SERVICE_HISTORY,
        color: "#16a34a",
        disabled: false,
    },
    {
        title: "Total Bills",
        description: "View billing statistics",
        icon: "file-text",
        color: "#e5e7eb",
        disabled: false,
    },
    {
        title: "Inventory",
        description: "Manage garage inventory",
        icon: "settings",
        color: "#e5e7eb",
        disabled: false,
    },
] as const;

export default function DashboardScreen() {
    const router = useRouter();

    // ✅ Correct Android back-button handling
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                // Block back navigation (prevents going to Login)
                return true;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => {
                subscription.remove();
            };
        }, [])
    );

    return (
        <ScrollView style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.brand}>
                    <View style={styles.brandIcon}>
                        <MaterialCommunityIcons
                            name="snowflake"
                            size={20}
                            color="#ffffff"
                        />
                    </View>
                    <Text style={styles.brandText}>Balwa Car Cool</Text>
                </View>

                <Pressable
                    onPress={async () => {
                        await supabase.auth.signOut();
                        router.replace(ROUTES.LOGIN);
                    }}
                >
                    <View style={styles.logout}>
                        <Feather name="log-out" size={16} color="#64748b" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </View>
                </Pressable>
            </View>

            {/* Content */}
            <View style={styles.container}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.subtitle}>
                    Welcome back! What would you like to do today?
                </Text>

                {/* Action Cards */}
                <View style={styles.cards}>
                    {dashboardCards.map((card) => (
                        <Pressable
                            key={card.title}
                            disabled={card.disabled}
                            onPress={() => {
                                if (!card.disabled && "route" in card) {
                                    router.push(card.route);
                                }
                            }}
                            style={[styles.card, card.disabled && { opacity: 0.5 }]}
                        >
                            <View
                                style={[
                                    styles.cardIcon,
                                    { backgroundColor: card.color },
                                ]}
                            >
                                <Feather
                                    name={card.icon as any}
                                    size={26}
                                    color="#ffffff"
                                />
                            </View>

                            <Text style={styles.cardTitle}>{card.title}</Text>
                            <Text style={styles.cardText}>{card.description}</Text>

                            {card.disabled && (
                                <Text style={styles.comingSoon}>Coming Soon</Text>
                            )}
                        </Pressable>
                    ))}
                </View>

                {/* Stats */}
                <View style={styles.stats}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Today's Bills</Text>
                        <Text style={styles.statValue}>3</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Today's Revenue</Text>
                        <Text style={[styles.statValue, { color: "#16a34a" }]}>
                            ₹4,500
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>This Month</Text>
                        <Text style={styles.statValue}>45 Bills</Text>
                    </View>
                </View>
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
        backgroundColor: "#f1f5f9",
    },

    header: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingTop: 30,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },

    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    brandIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
    },

    brandText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },

    logout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    logoutText: {
        fontSize: 14,
        color: "#64748b",
    },

    container: {
        padding: 16,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
    },

    subtitle: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 24,
    },

    cards: {
        gap: 16,
    },

    card: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },

    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    cardTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },

    cardText: {
        fontSize: 14,
        color: "#64748b",
    },

    comingSoon: {
        marginTop: 10,
        fontSize: 12,
        color: "#64748b",
    },

    stats: {
        marginTop: 32,
        gap: 16,
    },

    statCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    statLabel: {
        fontSize: 13,
        color: "#64748b",
        marginBottom: 6,
    },

    statValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a",
    },
});
