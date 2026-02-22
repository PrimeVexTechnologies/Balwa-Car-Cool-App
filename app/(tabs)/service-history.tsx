import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

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

  services: ServiceItem[];
};

/* ------------------------------------------------------------------ */
/* SCREEN */
/* ------------------------------------------------------------------ */

export default function ServiceHistoryScreen() {
  const [query, setQuery] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------ */
  /* FETCH BILLS */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("bills")
        .select(
          `
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

          bill_services (
            service_total,
            services (
              service_name
            )
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Bill[] = data.map((b: any) => ({
          id: b.id,
          invoice_no: b.invoice_no,
          created_at: b.created_at,
          total_amount: b.total_amount,

          customer: b.customers,
          car: b.cars,

          services: b.bill_services.map((s: any) => ({
            name: s.services?.service_name ?? "Service",
            price: s.service_total,
          })),
        }));

        setBills(mapped);
      }
    } catch (err) {
      console.log("Fetch Error:", err);
      setError("Failed to load service history");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* SEARCH */
  /* ------------------------------------------------------------------ */

  const filteredBills = bills.filter((b) => {
    const q = query.toLowerCase();

    return (
      b.car.car_number.toLowerCase().includes(q) ||
      b.customer.name.toLowerCase().includes(q) ||
      b.customer.mobile.includes(query)
    );
  });

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <View style={styles.container}>
      {/* SEARCH */}

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color="#64748b" />

        <TextInput
          placeholder="Search by car, name or mobile"
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />

        {query !== "" && (
          <Pressable onPress={() => setQuery("")}>
            <Feather name="x" size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>

      {/* LIST */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {/* Loading */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.infoText}>Loading bills...</Text>
          </View>
        )}

        {/* Error */}
        {!loading && error !== "" && (
          <View style={styles.centerBox}>
            <Feather name="alert-circle" size={42} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>

            <Pressable style={styles.retryBtn} onPress={fetchBills}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Empty */}
        {!loading && error === "" && filteredBills.length === 0 && (
          <View style={styles.centerBox}>
            <Feather name="file-text" size={48} color="#94a3b8" />
            <Text style={styles.infoText}>No records found</Text>
          </View>
        )}

        {/* Data */}
        {!loading &&
          error === "" &&
          filteredBills.map((bill) => (
            <Pressable
              key={bill.id}
              onPress={() => setSelectedBill(bill)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.billId}>{bill.invoice_no}</Text>

                <Text style={styles.total}>₹{bill.total_amount}</Text>
              </View>

              <Text style={styles.name}>{bill.customer.name}</Text>

              <Text style={styles.meta}>
                {bill.car.car_number} • {bill.car.car_model}
              </Text>

              <Text style={styles.date}>
                {new Date(bill.created_at).toLocaleDateString()}
              </Text>
            </Pressable>
          ))}
      </ScrollView>

      {/* ================= INVOICE PREVIEW ================= */}

      {selectedBill && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.invoiceContainer}
            >
              {/* Header */}
              <View style={styles.invoiceHeader}>
                <Text style={styles.shopName}>Balwa Car Cool</Text>

                <Text style={styles.invoiceNo}>
                  Invoice #{selectedBill.invoice_no}
                </Text>

                <Text style={styles.invoiceDate}>
                  {new Date(selectedBill.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Customer */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Details</Text>

                <Text style={styles.infoText}>
                  {selectedBill.customer.name}
                </Text>

                <Text style={styles.infoText}>
                  {selectedBill.customer.mobile}
                </Text>

                <Text style={styles.infoText}>
                  {selectedBill.car.car_number} • {selectedBill.car.car_model}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Services */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>

                {selectedBill.services.map((s, i) => (
                  <View key={i} style={styles.serviceRow}>
                    <Text style={styles.serviceName}>{s.name}</Text>

                    <Text style={styles.servicePrice}>₹{s.price}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Total */}
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Amount</Text>

                <Text style={styles.totalValue}>
                  ₹{selectedBill.total_amount}
                </Text>
              </View>

              {/* Close */}
              <Pressable
                style={styles.closeBtn}
                onPress={() => setSelectedBill(null)}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  /* Search */

  searchBox: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 14,
    gap: 8,

    elevation: 3,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#0f172a",
  },

  /* List */

  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },

  centerBox: {
    alignItems: "center",
    marginTop: 60,
    gap: 10,
  },

  infoText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Poppins-Regular",
  },

  errorText: {
    fontSize: 13,
    color: "#ef4444",
    fontFamily: "Poppins-Medium",
  },

  retryBtn: {
    marginTop: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
  },

  /* Card */

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,

    elevation: 3,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  billId: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
  },

  name: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0f172a",
  },

  meta: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
    marginTop: 2,
  },

  date: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#94a3b8",
    marginTop: 6,
  },

  total: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#16a34a",
  },

  /* Modal */

  modalOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "85%",
  },

  /* Invoice */

  invoiceContainer: {
    padding: 20,
  },

  invoiceHeader: {
    alignItems: "center",
    marginBottom: 14,
  },

  shopName: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#0f172a",
  },

  invoiceNo: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#2563eb",
  },

  invoiceDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },

  section: {
    gap: 4,
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#0f172a",
    marginBottom: 4,
  },

  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  serviceName: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    flex: 1,
  },

  servicePrice: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },

  totalBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-end",
    marginTop: 6,
  },

  totalLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
  },

  totalValue: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#16a34a",
  },

  closeBtn: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#2563eb",
    borderRadius: 12,
  },

  closeText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
});
