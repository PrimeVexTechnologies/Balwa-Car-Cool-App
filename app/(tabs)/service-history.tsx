import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

/* ---------------- TYPES ---------------- */

type ServiceItem = {
    name: string;
    price: number;
};

type Bill = {
    id: string;
    invoice_no: string;
    created_at: string;
    total_amount: number;
    customer: {
        name: string;
        mobile: string;
    };
    car: {
        car_number: string;
        car_model: string;
    };
    bill_items: ServiceItem[];
};

/* ---------------- SCREEN ---------------- */

export default function ServiceHistoryScreen() {
    const [query, setQuery] = useState("");
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBills = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("bills")
                .select(`
                    id,
                    invoice_no,
                    created_at,
                    total_amount,
                    customers:customer_id (
                        name,
                        mobile
                    ),
                    cars:car_id (
                        car_number,
                        car_model
                    ),
                    bill_items (
                        service_name,
                        price
                    )
                `)
                .order("created_at", { ascending: false });

            if (!error && data) {
                const mapped: Bill[] = data.map((b: any) => ({
                    id: b.id,
                    invoice_no: b.invoice_no,
                    created_at: b.created_at,
                    total_amount: b.total_amount,
                    customer: b.customers,
                    car: b.cars,
                    bill_items: b.bill_items.map((i: any) => ({
                        name: i.service_name,
                        price: i.price,
                    })),
                }));

                setBills(mapped);
            }

            setLoading(false);
        };

        fetchBills();
    }, []);

    const filtered = bills.filter(
        (b) =>
            b.car.car_number.toLowerCase().includes(query.toLowerCase()) ||
            b.customer.name.toLowerCase().includes(query.toLowerCase()) ||
            b.customer.mobile.includes(query)
    );

    return (
        <ScrollView style={styles.screen}>
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
                {loading ? (
                    <Text style={styles.emptyText}>Loading...</Text>
                ) : filtered.length === 0 ? (
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
                            <Text style={styles.billId}>
                                {bill.invoice_no}
                            </Text>
                            <Text style={styles.name}>
                                {bill.customer.name}
                            </Text>
                            <Text style={styles.meta}>
                                {bill.car.car_number} •{" "}
                                {bill.car.car_model}
                            </Text>

                            <View style={styles.row}>
                                <Text style={styles.date}>
                                    {new Date(
                                        bill.created_at
                                    ).toLocaleDateString()}
                                </Text>
                                <Text style={styles.total}>
                                    ₹{bill.total_amount}
                                </Text>
                            </View>
                        </Pressable>
                    ))
                )}
            </View>

            {/* Detail Modal */}
            {selectedBill && (
                <View style={styles.modal}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Invoice</Text>
                        <Text style={styles.modalSub}>
                            {selectedBill.invoice_no}
                        </Text>

                        <Text style={styles.sectionTitle}>Customer</Text>
                        <Text>{selectedBill.customer.name}</Text>
                        <Text>{selectedBill.customer.mobile}</Text>
                        <Text>
                            {selectedBill.car.car_number} •{" "}
                            {selectedBill.car.car_model}
                        </Text>

                        <Text style={styles.sectionTitle}>Services</Text>
                        {selectedBill.bill_items.map((s, i) => (
                            <View key={i} style={styles.serviceRow}>
                                <Text>{s.name}</Text>
                                <Text>₹{s.price}</Text>
                            </View>
                        ))}

                        <Text style={styles.totalBig}>
                            ₹{selectedBill.total_amount}
                        </Text>

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
    emptyText: { marginTop: 12, color: "#64748b", textAlign: "center" },

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
