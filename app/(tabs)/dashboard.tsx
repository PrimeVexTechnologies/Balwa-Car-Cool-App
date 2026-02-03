import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ROUTES = {
    CREATE_BILL: "/create-bill",
    SERVICE_HISTORY: "/service-history",
    LOGIN: "/login",
    INVENTORY: "/inventory",
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
        title: "Inventory",
        description: "Manage garage inventory",
        icon: "box",
        color: "#401c0a",
        route: ROUTES.INVENTORY,
        disabled: false,
    },
    {
        title: "Total Bills",
        description: "View billing statistics",
        icon: "file-text",
        color: "#dbd058",
        disabled: false,
    },
] as const;

export default function DashboardScreen() {
    const router = useRouter();

    // ✅ Block Android back button on Dashboard
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true;

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove();
        }, [])
    );

    return (
        <ScrollView style={styles.screen}>
            <Text style={styles.title}>Balwa Car Cool</Text>

            {/* Stats (still hardcoded – will be DB-driven next) */}
            <View style={styles.statsRow}>
                <View style={styles.statPill}>
                    <Text style={styles.statSmallLabel}>Today</Text>
                    <Text style={styles.statMain}>3</Text>
                    <Text style={styles.statSub}>Bills</Text>
                </View>

                <View style={styles.statPill}>
                    <Text style={styles.statSmallLabel}>Revenue</Text>
                    <Text style={[styles.statMain, { color: "#16a34a" }]}>
                        ₹4,500
                    </Text>
                    <Text style={styles.statSub}>Today</Text>
                </View>

                <View style={styles.statPill}>
                    <Text style={styles.statSmallLabel}>This Month</Text>
                    <Text style={styles.statMain}>45</Text>
                    <Text style={styles.statSub}>Bills</Text>
                </View>
            </View>

            <View style={styles.container}>
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

    container: {
        padding: 16,
    },

    cards: {
        gap: 16,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a",
        marginTop: 24,
        marginHorizontal: 16,
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

    statsRow: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        marginTop: 16,
    },

    statPill: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    statSmallLabel: {
        fontSize: 12,
        color: "#64748b",
    },

    statMain: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0f172a",
        marginVertical: 2,
    },

    statSub: {
        fontSize: 11,
        color: "#94a3b8",
    },
});
