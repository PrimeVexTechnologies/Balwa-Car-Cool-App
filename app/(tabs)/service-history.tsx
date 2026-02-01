import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

/* ---------------- MOCK DATA ---------------- */

const mockHistory = [
    {
        id: "BCC-001234",
        date: "28 Jan 2026",
        customerName: "Rahul Sharma",
        carNumber: "MH 12 AB 1234",
        carModel: "Maruti Swift",
        mobile: "9876543210",
        problems: ["A/C Not Cooling", "Gas Leakage"],
        services: [
            { name: "Servicing", price: 500 },
            { name: "Gas Charging", price: 1500 },
            { name: "Leak Testing", price: 300 },
        ],
        total: 2300,
    },
    {
        id: "BCC-001233",
        date: "27 Jan 2026",
        customerName: "Priya Patel",
        carNumber: "MH 14 CD 5678",
        carModel: "Honda City",
        mobile: "9876543211",
        problems: ["Compressor Issue"],
        services: [
            { name: "Compressor", price: 8000 },
            { name: "Labour Charge", price: 500 },
        ],
        total: 8500,
    },
];

/* ---------------- SCREEN ---------------- */

export default function ServiceHistoryScreen() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [selectedBill, setSelectedBill] =
        useState<(typeof mockHistory)[0] | null>(null);

    const filtered = mockHistory.filter(
        (b) =>
            b.carNumber.toLowerCase().includes(query.toLowerCase()) ||
            b.customerName.toLowerCase().includes(query.toLowerCase()) ||
            b.mobile.includes(query)
    );

    return (
        <ScrollView style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Feather name="arrow-left" size={22} />
                </Pressable>

                <View style={styles.brand}>
                    <MaterialCommunityIcons
                        name="snowflake"
                        size={18}
                        color="#2563eb"
                    />
                    <Text style={styles.brandText}>Service History</Text>
                </View>

                <Pressable onPress={() => router.replace("/login")}>
                    <Feather name="log-out" size={18} />
                </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
                <Feather name="search" size={18} color="#64748b" />
                <TextInput
                    placeholder="Search by car, mobile or name"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.searchInput}
                />
            </View>

            {/* List */}
            <View style={styles.list}>
                {filtered.length === 0 ? (
                    <View style={styles.empty}>
                        <Feather name="file-text" size={48} color="#94a3b8" />
                        <Text style={styles.emptyText}>No records found</Text>
                    </View>
                ) : (
                    filtered.map((bill) => (
                        <Pressable
                            key={bill.id}
                            style={styles.card}
                            onPress={() => setSelectedBill(bill)}
                        >
                            <Text style={styles.billId}>{bill.id}</Text>
                            <Text style={styles.name}>{bill.customerName}</Text>
                            <Text style={styles.meta}>
                                {bill.carNumber} • {bill.carModel}
                            </Text>

                            <View style={styles.row}>
                                <Text style={styles.date}>{bill.date}</Text>
                                <Text style={styles.total}>₹{bill.total}</Text>
                            </View>
                        </Pressable>
                    ))
                )}
            </View>

            {/* Detail Modal (RN style inline) */}
            {selectedBill && (
                <View style={styles.modal}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Invoice</Text>
                        <Text style={styles.modalSub}>{selectedBill.id}</Text>

                        <Text style={styles.sectionTitle}>Customer</Text>
                        <Text>{selectedBill.customerName}</Text>
                        <Text>{selectedBill.mobile}</Text>
                        <Text>
                            {selectedBill.carNumber} • {selectedBill.carModel}
                        </Text>

                        <Text style={styles.sectionTitle}>Services</Text>
                        {selectedBill.services.map((s, i) => (
                            <View key={i} style={styles.serviceRow}>
                                <Text>{s.name}</Text>
                                <Text>₹{s.price}</Text>
                            </View>
                        ))}

                        <Text style={styles.totalBig}>₹{selectedBill.total}</Text>

                        <Pressable
                            style={styles.closeBtn}
                            onPress={() => setSelectedBill(null)}
                        >
                            <Text style={styles.closeText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#f1f5f9" },

    header: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    brand: { flexDirection: "row", alignItems: "center", gap: 6 },
    brandText: { fontSize: 16, fontWeight: "600" },

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        margin: 16,
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },

    searchInput: { flex: 1, fontSize: 14 },

    list: { padding: 16, gap: 12 },

    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
    },

    billId: { fontSize: 12, color: "#64748b" },
    name: { fontSize: 16, fontWeight: "600" },
    meta: { fontSize: 13, color: "#64748b", marginBottom: 8 },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    date: { fontSize: 12, color: "#64748b" },
    total: { fontSize: 16, fontWeight: "700", color: "#16a34a" },

    empty: { alignItems: "center", marginTop: 60 },
    emptyText: { marginTop: 12, color: "#64748b" },

    modal: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 16,
    },

    modalCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },

    modalTitle: { fontSize: 18, fontWeight: "700" },
    modalSub: { fontSize: 13, color: "#64748b", marginBottom: 8 },

    sectionTitle: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: "600",
    },

    serviceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 2,
    },

    totalBig: {
        marginTop: 12,
        fontSize: 22,
        fontWeight: "700",
        color: "#16a34a",
        textAlign: "right",
    },

    closeBtn: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#2563eb",
        borderRadius: 8,
    },

    closeText: { color: "#fff", textAlign: "center" },
});
