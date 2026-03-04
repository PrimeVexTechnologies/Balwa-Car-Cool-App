// ============================
// CreateBillScreen.tsx
// PART 1 OF 2 (Main Screen)
// ============================

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "@/src/core/lib/supabase";

import Step1Vehicle from "@/src/features/billing/components/Step1Vehicle";
import Step2Problems from "@/src/features/billing/components/Step2Problems";
import Step3Services from "@/src/features/billing/components/Step3Services";
import Step4Final from "@/src/features/billing/components/Step4Final";
import { PrimaryBtn, Option } from "@/src/features/billing/components/BillingCommon";

import {
  loadBillingInitialData,
  fetchCarByNumber,
  createFullInvoice,
} from "@/src/features/billing/services/billing.service";

import {
  Service,
  Problem,
  Product,
  SelectedService,
  PartItem,
} from "@/src/features/billing/types/billing.types";

/* ------------------------------------------------------------------ */
/* THEME */
/* ------------------------------------------------------------------ */

const COLORS = {
  primary: "#2563eb",
  success: "#16a34a",
  danger: "#ef4444",

  bg: "#f1f5f9",
  card: "#ffffff",

  text: "#0f172a",
  muted: "#64748b",
  gray: "#94a3b8",
  border: "#e2e8f0",
};

/* ------------------------------------------------------------------ */
/* MAIN */
/* ------------------------------------------------------------------ */

export default function CreateBillScreen() {
  const [step, setStep] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [fetchingCar, setFetchingCar] = useState(false);
  const [error, setError] = useState("");
  const [step1Error, setStep1Error] = useState("");

  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [problemsList, setProblemsList] = useState<Problem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [problems, setProblems] = useState<string[]>([]);
  const [otherProblem, setOtherProblem] = useState("");

  const [services, setServices] = useState<Record<string, SelectedService>>({});

  const [laborCharge, setLaborCharge] = useState("");
  const [extraCharge, setExtraCharge] = useState("");
  const [remarks, setRemarks] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  const [vehicleForm, setVehicleForm] = useState({
    carNumber: "",
    customerName: "",
    mobile: "",
    carModel: "",
  });

  const [vehicleTouched, setVehicleTouched] = useState({
    carNumber: false,
    customerName: false,
    mobile: false,
    carModel: false,
  });

  const [vehicleErrors, setVehicleErrors] = useState({
    carNumber: "",
    customerName: "",
    mobile: "",
    carModel: "",
  });

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadBillingInitialData();
        setServicesList(data.services);
        setProducts(data.products);
        setProblemsList(data.problems);
      } catch (err) {
        console.log("Load error:", err);
      }
    };
    init();
  }, []);

  /* ---------------- FETCH CAR ---------------- */

  const fetchCarDetails = useCallback(async () => {
    try {
      setFetchingCar(true);

      const data = await fetchCarByNumber(vehicleForm.carNumber);

      if (!data) {
        Alert.alert("Car not found in database");
        return;
      }

      setVehicleForm((p) => ({
        ...p,
        carModel: data.car_model || "",
        customerName: data.customers?.name || "",
        mobile: data.customers?.mobile || "",
      }));
    } catch {
      Alert.alert("Error fetching car");
    } finally {
      setFetchingCar(false);
    }
  }, [vehicleForm.carNumber]);

  /* ---------------- HELPERS ---------------- */

  const toggleProblem = (id: string) => {
    setProblems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleService = (id: string) => {
    setServices((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      return {
        ...prev,
        [id]: {
          service_charge: 0,
          parts: [],
        },
      };
    });
  };

  /* ---------------- VALIDATION ---------------- */

  const validateStep1 = () => {
    if (!vehicleForm.carNumber.trim()) {
      setStep1Error("Car number is required");
      return false;
    }

    if (!vehicleForm.customerName.trim()) {
      setStep1Error("Customer name is required");
      return false;
    }

    if (!/^\d{10}$/.test(vehicleForm.mobile)) {
      setStep1Error("Enter valid 10-digit mobile number");
      return false;
    }

    if (!vehicleForm.carModel.trim()) {
      setStep1Error("Car model is required");
      return false;
    }

    setStep1Error("");
    return true;
  };

  const validateVehicleField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "carNumber":
        if (!value.trim()) error = "Car number is required";
        break;
      case "customerName":
        if (!value.trim()) error = "Customer name is required";
        break;
      case "mobile":
        if (!/^\d{10}$/.test(value))
          error = "Enter valid 10 digit mobile number";
        break;
      case "carModel":
        if (!value.trim()) error = "Car model is required";
        break;
    }

    setVehicleErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  /* ---------------- TOTAL ---------------- */

  const previewTotal =
    Object.values(services).reduce((sum, s) => {
      const parts = s.parts.reduce(
        (p, x) => p + x.quantity * x.price_per_unit,
        0,
      );
      return sum + parts + s.service_charge;
    }, 0) +
    Number(laborCharge || 0) +
    Number(extraCharge || 0);

  /* ---------------- UI ---------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Invoice</Text>
          <Text style={styles.subtitle}>
            Enter vehicle & service information
          </Text>
        </View>

        <View style={styles.progress}>
          {[1, 2, 3, 4].map((n) => (
            <View key={n} style={styles.progressItem}>
              <View
                style={[
                  styles.progressCircle,
                  step >= n && styles.progressActive,
                ]}
              >
                <Text style={styles.progressText}>{n}</Text>
              </View>
              {n < 4 && <View style={styles.progressLine} />}
            </View>
          ))}
        </View>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.card}>
            <Step1Vehicle
              vehicleForm={vehicleForm}
              vehicleTouched={vehicleTouched}
              vehicleErrors={vehicleErrors}
              step1Error={step1Error}
              fetchingCar={fetchingCar}
              setVehicleForm={setVehicleForm}
              setVehicleTouched={setVehicleTouched}
              validateVehicleField={validateVehicleField}
              fetchCarDetails={fetchCarDetails}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Step2Problems
              problemsList={problemsList}
              problems={problems}
              otherProblem={otherProblem}
              setOtherProblem={setOtherProblem}
              toggleProblem={toggleProblem}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <Step3Services
              servicesList={servicesList}
              services={services}
              setServices={setServices}
              toggleService={toggleService}
              setActiveServiceId={setActiveServiceId}
              setModalVisible={setModalVisible}
            />
          </View>
        )}

        {step === 4 && (
          <View style={styles.card}>
            <Step4Final
              previewTotal={previewTotal}
              laborCharge={laborCharge}
              extraCharge={extraCharge}
              remarks={remarks}
              setLaborCharge={setLaborCharge}
              setExtraCharge={setExtraCharge}
              setRemarks={setRemarks}
            />
          </View>
        )}

        <View style={styles.nav}>
          {step > 1 && (
            <PrimaryBtn title="Back" onPress={() => setStep(step - 1)} />
          )}

          {step < 4 ? (
            <PrimaryBtn
              title="Continue"
              onPress={() => {
                if (step === 1 && !validateStep1()) return;
                setStep(step + 1);
              }}
            />
          ) : (
            <PrimaryBtn
              title={loading ? "Processing..." : "Generate Invoice"}
              disabled={loading}
              onPress={async () => {
                try {
                  setLoading(true);
                  setError("");

                  const res = await createFullInvoice({
                    vehicleForm,
                    services,
                    problems,
                    problemsList,
                    otherProblem,
                    laborCharge,
                    extraCharge,
                    remarks,
                  });

                  Alert.alert(
                    "Success",
                    `Invoice ${res.invoice_no} generated`,
                  );

                  setStep(1);
                } catch (err: any) {
                  setError(err.message || "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}
        </View>

        <InventoryModal
          visible={modalVisible}
          products={products}
          onClose={() => setModalVisible(false)}
          onAdd={(part: PartItem) => {
            if (!activeServiceId) return;

            setServices((prev) => ({
              ...prev,
              [activeServiceId]: {
                ...(prev[activeServiceId] ?? {
                  service_charge: 0,
                  parts: [],
                }),
                parts: [...(prev[activeServiceId]?.parts ?? []), part],
              },
            }));

            setActiveServiceId(null);
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= MODAL ================= */

function InventoryModal({
  visible,
  products,
  onClose,
  onAdd,
}: any) {
  const [product, setProduct] = useState<any>(null);
  const [variant, setVariant] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);

  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  const handleBack = () => {
    if (variant) {
      setVariant(null);
      return;
    }

    if (product) {
      setProduct(null);
      setVariants([]);
      return;
    }

    onClose();
  };

  /* Reset when modal opens */
  useEffect(() => {
    if (visible) {
      setProduct(null);
      setVariant(null);
      setVariants([]);
      setQty("1");
      setPrice("");
    }
  }, [visible]);

  /* Load variants */
  const loadVariants = async (productId: string) => {
    const { data, error } = await supabase
      .from("inventory_variants")
      .select("id, variant_name, quantity")
      .eq("product_id", productId);

    if (error) {
      Alert.alert("Failed to load variants");
      return;
    }

    setVariants(data || []);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <Pressable onPress={handleBack} style={styles.modalBackBtn}>
              {(product || variant) && (
                <Text style={styles.modalBackText}>‹ Back</Text>
              )}
            </Pressable>

            <Text style={styles.modalTitle}>
              {!product && "Select Product"}
              {product && !variant && "Select Variant"}
              {variant && "Part Details"}
            </Text>

            <Pressable onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* PRODUCT LIST */}
            {!product &&
              products.map((p: any) => (
                <Pressable
                  key={p.id}
                  style={({ pressed }) => [
                    styles.modalItem,
                    pressed && styles.modalItemPressed,
                  ]}
                  onPress={() => {
                    setProduct(p);
                    loadVariants(p.id);
                  }}
                >
                  <Text style={styles.modalItemText}>{p.name}</Text>
                  <Text style={styles.modalArrow}>›</Text>
                </Pressable>
              ))}

            {/* VARIANT LIST */}
            {product &&
              !variant &&
              variants.map((v: any) => (
                <Pressable
                  key={v.id}
                  style={({ pressed }) => [
                    styles.modalItem,
                    pressed && styles.modalItemPressed,
                  ]}
                  onPress={() => setVariant(v)}
                >
                  <View>
                    <Text style={styles.modalItemText}>
                      {v.variant_name}
                    </Text>
                    <Text style={styles.modalSubText}>
                      Stock: {v.quantity}
                    </Text>
                  </View>

                  <Text style={styles.modalArrow}>›</Text>
                </Pressable>
              ))}

            {/* PART DETAILS FORM */}
            {variant && (
              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Quantity</Text>

                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={qty}
                  onChangeText={setQty}
                />

                <Text style={styles.modalLabel}>Price per unit</Text>

                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.modalAddBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => {
                    if (Number(qty) <= 0) {
                      Alert.alert("Enter valid quantity");
                      return;
                    }

                    if (Number(qty) > variant.quantity) {
                      Alert.alert("Not enough stock");
                      return;
                    }

                    onAdd({
                      inventory_variant_id: variant.id,
                      variant_name: variant.variant_name,
                      quantity: Number(qty),
                      price_per_unit: Number(price) || 0,
                    });

                    onClose();
                  }}
                >
                  <Text style={styles.modalAddText}>Add Part</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
    marginTop: 4,
  },

  progress: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
  },

  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  progressActive: {
    backgroundColor: COLORS.primary,
  },

  progressText: {
    color: "#fff",
    fontWeight: "600",
  },

  progressLine: {
    width: 28,
    height: 2,
    backgroundColor: "#e5e7eb",
  },

  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    elevation: 3,
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 12,
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.text,
  },

  modalClose: {
    fontSize: 18,
    color: COLORS.gray,
  },

  modalBackBtn: {
    minWidth: 60,
  },

  modalBackText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Poppins-SemiBold",
  },

  modalItem: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalItemPressed: {
    transform: [{ scale: 0.98 }],
  },

  modalItemText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.text,
  },

  modalSubText: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  modalArrow: {
    fontSize: 18,
    color: COLORS.gray,
  },

  modalForm: {
    marginTop: 10,
  },

  modalLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },

  modalAddBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },

  modalAddText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
});