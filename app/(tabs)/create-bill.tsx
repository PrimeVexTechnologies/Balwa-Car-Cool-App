// ============================
// CreateBillScreen.tsx
// PART 1 — TOP + STEPS 1 & 2
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

import { supabase } from "@/lib/supabase";
import { generateBill } from "@/utils/generateBill";
import { generateBillPDF } from "@/utils/pdfService";

/* ------------------------------------------------------------------ */
/* THEME */
/* ------------------------------------------------------------------ */

const COLORS = {
  primary: "#2563eb",
  success: "#16a34a",
  danger: "#ef4444",

  bg: "#f8fafc",
  card: "#ffffff",

  text: "#0f172a",
  muted: "#64748b",
  gray: "#94a3b8",
  border: "#e5e7eb",
};

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

type Service = {
  id: string;
  service_name: string;
};

type Problem = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
};

type Variant = {
  id: string;
  variant_name: string;
  quantity: number;
};

type PartItem = {
  inventory_variant_id: string;
  variant_name: string;
  quantity: number;
  price_per_unit: number;
};

type SelectedService = {
  service_charge: number;
  parts: PartItem[];
};

type CarWithCustomer = {
  car_model: string | null;
  customers: {
    name: string;
    mobile: string;
  } | null;
};

/* ------------------------------------------------------------------ */
/* MAIN */
/* ------------------------------------------------------------------ */

export default function CreateBillScreen() {
  /* Steps */

  const [step, setStep] = useState<number>(1);

  /* Status */

  const [loading, setLoading] = useState(false);
  const [fetchingCar, setFetchingCar] = useState(false);
  const [error, setError] = useState("");

  const [step1Error, setStep1Error] = useState("");

  /* Vehicle */

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [carModel, setCarModel] = useState("");

  /* Lists */

  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [problemsList, setProblemsList] = useState<Problem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  /* Problems */

  const [problems, setProblems] = useState<string[]>([]);
  const [otherProblem, setOtherProblem] = useState("");

  /* Services */

  const [services, setServices] = useState<Record<string, SelectedService>>({});

  /* Charges */

  const [laborCharge, setLaborCharge] = useState("");
  const [extraCharge, setExtraCharge] = useState("");
  const [remarks, setRemarks] = useState("");

  /* Modal */

  const [modalVisible, setModalVisible] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  // const [variants, setVariants] = useState<Variant[]>([]);

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

  /* ------------------------------------------------------------------ */
  /* LOAD DATA */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [s, p, pr] = await Promise.all([
        supabase
          .from("services")
          .select("id, service_name")
          .eq("is_active", true),

        supabase.from("inventory_products").select("id, name"),

        supabase.from("problem_types").select("id, name"),
      ]);

      if (s.data) setServicesList(s.data);
      if (p.data) setProducts(p.data);
      if (pr.data) setProblemsList(pr.data);
    } catch (err) {
      console.log("Load error:", err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* FETCH CAR (AUTO + BUTTON) */
  /* ------------------------------------------------------------------ */

  const fetchCarDetails = useCallback(async () => {
    const number = vehicleForm.carNumber.trim().toUpperCase();

    if (!number) {
      console.log("Car number empty");
      return;
    }

    console.log("Fetching for:", number);

    try {
      setFetchingCar(true);

      const { data, error } = await supabase
        .from("cars")
        .select(
          `
          car_model,
          customers:customer_id (
            name,
            mobile
          )
        `,
        )
        .eq("car_number", vehicleForm.carNumber)
        .maybeSingle<CarWithCustomer>();

      console.log("Supabase response:", data, error);

      if (error) {
        console.log("Fetch error:", error);
        Alert.alert("Error fetching car");
        return;
      }

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
    } finally {
      setFetchingCar(false);
    }
  }, [vehicleForm.carNumber]);

  /* ------------------------------------------------------------------ */
  /* HELPERS */
  /* ------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------ */
  /* VALIDATION */
  /* ------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.title}>Create Invoice</Text>
          <Text style={styles.subtitle}>
            Enter vehicle & service information
          </Text>
        </View>

        {/* PROGRESS */}

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

        {error !== "" && <Text style={styles.error}>{error}</Text>}

        {/* ================= STEP 1 ================= */}

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>

            {/* Form Level Error */}
            {step1Error !== "" && (
              <View style={styles.formErrorBox}>
                <Text style={styles.formErrorText}>{step1Error}</Text>
              </View>
            )}

            {/* Car Number + Fetch */}
            <View
              style={[
                styles.input,
                styles.fetchWrapper,
                vehicleTouched.carNumber &&
                  vehicleErrors.carNumber &&
                  styles.inputError,
              ]}
            >
              <TextInput
                style={styles.fetchTextInput}
                placeholder="Car Number"
                autoCapitalize="characters"
                value={vehicleForm.carNumber}
                onChangeText={(v) => {
                  setVehicleForm((p) => ({ ...p, carNumber: v }));
                  if (vehicleTouched.carNumber)
                    validateVehicleField("carNumber", v);
                }}
                onBlur={() => {
                  setVehicleTouched((p) => ({ ...p, carNumber: true }));
                  validateVehicleField("carNumber", vehicleForm.carNumber);
                }}
              />

              <Pressable style={styles.fetchIconBtn} onPress={fetchCarDetails}>
                {fetchingCar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.fetchIcon}>🔍</Text>
                )}
              </Pressable>
            </View>

            {vehicleTouched.carNumber && vehicleErrors.carNumber ? (
              <Text style={styles.fieldError}>{vehicleErrors.carNumber}</Text>
            ) : null}

            {/* Customer Name */}
            <TextInput
              style={[
                styles.input,
                vehicleTouched.customerName &&
                  vehicleErrors.customerName &&
                  styles.inputError,
              ]}
              placeholder="Customer Name"
              value={vehicleForm.customerName}
              onChangeText={(v) => {
                setVehicleForm((p) => ({ ...p, customerName: v }));
                if (vehicleTouched.customerName)
                  validateVehicleField("customerName", v);
              }}
              onBlur={() => {
                setVehicleTouched((p) => ({
                  ...p,
                  customerName: true,
                }));
                validateVehicleField("customerName", vehicleForm.customerName);
              }}
            />

            {vehicleTouched.customerName && vehicleErrors.customerName ? (
              <Text style={styles.fieldError}>
                {vehicleErrors.customerName}
              </Text>
            ) : null}

            {/* Mobile */}
            <TextInput
              style={[
                styles.input,
                vehicleTouched.mobile &&
                  vehicleErrors.mobile &&
                  styles.inputError,
              ]}
              placeholder="Mobile Number"
              keyboardType="number-pad"
              maxLength={10}
              value={vehicleForm.mobile}
              onChangeText={(v) => {
                setVehicleForm((p) => ({ ...p, mobile: v }));
                if (vehicleTouched.mobile) validateVehicleField("mobile", v);
              }}
              onBlur={() => {
                setVehicleTouched((p) => ({ ...p, mobile: true }));
                validateVehicleField("mobile", vehicleForm.mobile);
              }}
            />

            {vehicleTouched.mobile && vehicleErrors.mobile ? (
              <Text style={styles.fieldError}>{vehicleErrors.mobile}</Text>
            ) : null}

            {/* Car Model */}
            <TextInput
              style={[
                styles.input,
                vehicleTouched.carModel &&
                  vehicleErrors.carModel &&
                  styles.inputError,
              ]}
              placeholder="Car Model"
              value={vehicleForm.carModel}
              onChangeText={(v) => {
                setVehicleForm((p) => ({ ...p, carModel: v }));
                if (vehicleTouched.carModel)
                  validateVehicleField("carModel", v);
              }}
              onBlur={() => {
                setVehicleTouched((p) => ({ ...p, carModel: true }));
                validateVehicleField("carModel", vehicleForm.carModel);
              }}
            />

            {vehicleTouched.carModel && vehicleErrors.carModel ? (
              <Text style={styles.fieldError}>{vehicleErrors.carModel}</Text>
            ) : null}
          </View>
        )}

        {/* ================= STEP 2 ================= */}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Reported Problems</Text>

            {problemsList.map((p) => (
              <Option
                key={p.id}
                label={p.name}
                active={problems.includes(p.id)}
                onPress={() => toggleProblem(p.id)}
              />
            ))}

            <Option
              label="Other"
              active={problems.includes("other")}
              onPress={() => toggleProblem("other")}
            />

            {problems.includes("other") && (
              <TextInput
                style={styles.input}
                placeholder="Describe problem"
                value={otherProblem}
                onChangeText={setOtherProblem}
              />
            )}
          </View>
        )}
        {/* ================= STEP 3 ================= */}

        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Services Performed</Text>

            {servicesList.map((s) => {
              const selected = services[s.id];

              return (
                <View key={s.id} style={{ marginBottom: 16 }}>
                  <Option
                    label={s.service_name}
                    active={!!selected}
                    onPress={() => toggleService(s.id)}
                  />

                  {selected && (
                    <View style={{ marginTop: 14 }}>
                      <TextInput
                        style={styles.input}
                        placeholder="Service Charge"
                        keyboardType="numeric"
                        value={
                          selected.service_charge
                            ? String(selected.service_charge)
                            : ""
                        }
                        onChangeText={(v) =>
                          setServices((prev) => ({
                            ...prev,
                            [s.id]: {
                              ...(prev[s.id] ?? {
                                service_charge: 0,
                                parts: [],
                              }),
                              service_charge: Number(v) || 0,
                            },
                          }))
                        }
                      />

                      {selected.parts.map((p, i) => (
                        <View key={i} style={styles.partRowPremium}>
                          <Text style={styles.partText}>
                            {p.variant_name} × {p.quantity}
                          </Text>
                          <Text style={styles.partText}>
                            ₹{p.price_per_unit}
                          </Text>
                        </View>
                      ))}

                      <Pressable
                        style={styles.addPartPremiumBtn}
                        onPress={() => {
                          setActiveServiceId(s.id);
                          setModalVisible(true);
                        }}
                      >
                        <Text style={styles.addPartPremiumText}>
                          ＋ Add Part
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ================= STEP 4 ================= */}

        {step === 4 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Final Charges</Text>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Preview Total</Text>
              <Text style={styles.totalValue}>₹{previewTotal}</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Labor Charge"
              keyboardType="numeric"
              value={laborCharge}
              onChangeText={setLaborCharge}
            />

            <TextInput
              style={styles.input}
              placeholder="Extra Charge"
              keyboardType="numeric"
              value={extraCharge}
              onChangeText={setExtraCharge}
            />

            <TextInput
              style={[styles.input, { height: 90 }]}
              placeholder="Remarks"
              multiline
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        )}

        {/* ================= NAVIGATION ================= */}

        <View style={styles.nav}>
          {step > 1 && (
            <PrimaryBtn title="Back" onPress={() => setStep(step - 1)} />
          )}

          {step < 4 ? (
            <PrimaryBtn
              title="Continue"
              onPress={() => {
                if (step === 1) {
                  const valid = validateStep1();
                  if (!valid) return;
                }

                setStep(step + 1);
              }}
            />
          ) : (
            <PrimaryBtn
              title={loading ? "Processing..." : "Generate Invoice"}
              onPress={async () => {
                // if (!isStep1Valid) return;

                try {
                  setLoading(true);
                  setError("");

                  const { data: customer } = await supabase
                    .from("customers")
                    .upsert(
                      { name: customerName, mobile },
                      { onConflict: "mobile" },
                    )
                    .select()
                    .single();
                  if (!customer) throw new Error("Customer save failed");

                  const { data: car } = await supabase
                    .from("cars")
                    .upsert(
                      {
                        car_number: carNumber,
                        car_model: carModel,
                        customer_id: customer.id,
                      },
                      { onConflict: "car_number" },
                    )
                    .select()
                    .single();
                  if (!car) throw new Error("Car save failed");

                  const payload = Object.entries(services).map(([id, s]) => ({
                    service_id: id,
                    service_charge: s.service_charge,
                    parts: s.parts,
                  }));

                  const res: any = await generateBill({
                    customer_id: customer.id,
                    car_id: car.id,
                    problems: problems.map((p) =>
                      p === "other"
                        ? otherProblem
                        : problemsList.find((x) => x.id === p)?.name || "",
                    ),
                    services: payload,
                    labor_charge: Number(laborCharge) || 0,
                    extra_charge: Number(extraCharge) || 0,
                    remarks,
                  });

                  await generateBillPDF({
                    billId: res.bill_id,
                    invoiceNo: res.invoice_no,
                    customerName,
                    mobile,
                    carNumber,
                    carModel,
                  });

                  Alert.alert("Success", `Invoice ${res.invoice_no} generated`);

                  setStep(1);
                  setCustomerName("");
                  setMobile("");
                  setCarNumber("");
                  setCarModel("");
                  setProblems([]);
                  setOtherProblem("");
                  setServices({});
                  setLaborCharge("");
                  setExtraCharge("");
                  setRemarks("");
                } catch (err: any) {
                  setError(err.message || "Failed");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            />
          )}
        </View>

        {/* ================= MODAL ================= */}

        <InventoryModal
          visible={modalVisible}
          products={products}
          // variants={variants}
          // setVariants={setVariants}
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

            setActiveServiceId(null); // IMPORTANT
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= REUSABLE ================= */

function PrimaryBtn({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.btn, disabled && { opacity: 0.6 }]}
    >
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );
}

function Option({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, active && styles.optionActive]}
    >
      <Text>{label}</Text>
    </Pressable>
  );
}

/* ================= MODAL ================= */

function InventoryModal({ visible, products, onClose, onAdd }: any) {
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            {/* BACK */}
            <Pressable onPress={handleBack} style={styles.modalBackBtn}>
              {(product || variant) && (
                <Text style={styles.modalBackText}>‹ Back</Text>
              )}
            </Pressable>

            {/* TITLE */}
            <Text style={styles.modalTitle}>
              {!product && "Select Product"}
              {product && !variant && "Select Variant"}
              {variant && "Part Details"}
            </Text>

            {/* CLOSE */}
            <Pressable onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          {/* CONTENT */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* PRODUCT */}
            {!product && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Select Product</Text>

                {products.map((p: any) => (
                  <Pressable
                    key={p.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setProduct(p);
                      loadVariants(p.id);
                    }}
                  >
                    <Text style={styles.modalItemText}>{p.name}</Text>

                    <Text style={styles.modalArrow}>›</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* VARIANT */}
            {product && !variant && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Select Variant</Text>

                {variants.map((v: any) => (
                  <Pressable
                    key={v.id}
                    style={styles.modalItem}
                    onPress={() => setVariant(v)}
                  >
                    <View>
                      <Text style={styles.modalItemText}>{v.variant_name}</Text>

                      <Text style={styles.modalSubText}>
                        Stock: {v.quantity}
                      </Text>
                    </View>

                    <Text style={styles.modalArrow}>›</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* FORM */}
            {variant && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Part Details</Text>

                <Text style={styles.modalLabel}>Quantity</Text>

                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={qty}
                  onChangeText={setQty}
                />

                <Text style={styles.modalLabel}>Price</Text>

                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />

                <Pressable
                  style={styles.modalAddBtn}
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
    padding: 20,
    paddingTop: 30,
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
    marginBottom: 12,
  },

  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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

  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 8,
  },

  card: {
    backgroundColor: COLORS.card,
    margin: 16,
    padding: 18,
    borderRadius: 20,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#fff",
  },

  fetchRow: {
    flexDirection: "row",
    gap: 8,
  },

  fetchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  fetchText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },

  option: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },

  optionActive: {
    backgroundColor: "#e0f2fe",
    borderColor: COLORS.primary,
  },

  partRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  partText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  totalBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  totalLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },

  totalValue: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: COLORS.success,
    marginTop: 4,
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },

  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 120,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },

  modal: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.bg,
  },

  fieldError: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 8,
    fontFamily: "Poppins-Regular",
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  formErrorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  formErrorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },

  fetchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
  },

  fetchTextInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.text,
  },

  fetchIconBtn: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  fetchIcon: {
    fontSize: 16,
  },

  /* ===== MODAL PREMIUM UI ===== */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.text,
  },

  modalClose: {
    fontSize: 20,
    color: COLORS.muted,
  },

  modalSection: {
    marginBottom: 20,
  },

  modalSectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 10,
  },

  modalItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalItemText: {
    fontSize: 14,
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
    marginTop: 10,
  },

  modalAddText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },

  /* ===== STEP 3 POLISH ===== */

  addPartPremiumBtn: {
    backgroundColor: "#eff6ff", // soft blue
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  addPartPremiumText: {
    color: COLORS.primary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },

  partRowPremium: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },

  modalBackBtn: {
    minWidth: 60,
  },

  modalBackText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Poppins-SemiBold",
  },
});
