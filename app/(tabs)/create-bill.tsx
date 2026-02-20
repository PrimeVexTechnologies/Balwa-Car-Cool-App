import { useEffect, useState } from "react";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "@/lib/supabase";
import { generateBill } from "@/app/services/generateBill";
import { generateBillPDF } from "@/app/services/pdfService";

// TYPES 

type Service = {
  id: string;
  service_name: string;
};

type SelectedService = {
  service_charge: number;
  parts: {
    inventory_variant_id: string;
    variant_name: string;
    quantity: number;
    price_per_unit: number;
  }[];
};

interface ProblemType {
  id: string;
  name: string;
  created_at: string;
}

/* ============================================================
   SCREEN COMPONENT
============================================================ */

export default function CreateBillScreen() {

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [carModel, setCarModel] = useState("");
  const [fetchingCar, setFetchingCar] = useState(false);

  const [problemsList, setProblemsList] = useState<ProblemType[]>([]);

  const [laborCharge, setLaborCharge] = useState("");
  const [extraCharge, setExtraCharge] = useState("");
  const [remarks, setRemarks] = useState("");

  const [problems, setProblems] = useState<string[]>([]);
  const [otherProblem, setOtherProblem] = useState("");

  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [services, setServices] =
    useState<Record<string, SelectedService>>({});

  const [products, setProducts] = useState<
    { id: string; name: string }[]
  >([]);

  const [productVariants, setProductVariants] = useState<
    { id: string; variant_name: string }[]
  >([]);

  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<{
    id: string;
    variant_name: string;
  } | null>(null);

  const [modalQuantity, setModalQuantity] = useState("1");
  const [modalPrice, setModalPrice] = useState("");

  const [partModalVisible, setPartModalVisible] = useState(false);
  const [activeServiceId, setActiveServiceId] =
    useState<string | null>(null);

  /* --------------------------
     PREVIEW TOTAL 
  -------------------------- */

  const totalPreview =
    Object.values(services).reduce((sum, service) => {
      const partsTotal = service.parts.reduce(
        (pSum, part) =>
          pSum + part.quantity * part.price_per_unit,
        0
      );

      return sum + service.service_charge + partsTotal;
    }, 0) +
    (Number(laborCharge) || 0) +
    (Number(extraCharge) || 0);

  /* ============================================================
     DATA FETCHING 
  ============================================================ */

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("id, service_name")
        .eq("is_active", true)
        .order("service_name");

      if (data) setServicesList(data);
    };

    const fetchProducts = async () => {
      const { data } = await supabase
        .from("inventory_products")
        .select("id, name")
        .order("name");

      if (data) setProducts(data);
    };

    fetchServices();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from("problem_types")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Error fetching problems:", error);
      return;
    }

    setProblemsList(data);
  };

  /* ============================================================
     UI HELPERS
  ============================================================ */

  const toggleProblem = (id: string) => {
    setProblems((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const toggleService = (id: string) => {
    setServices((prev) => {
      if (prev[id]) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
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

  const addPartToService = (serviceId: string) => {
    setServices((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        parts: [
          ...prev[serviceId].parts,
          {
            inventory_variant_id: "",
            variant_name: "",
            quantity: 1,
            price_per_unit: 0,
          },
        ],
      },
    }));
  };


  /* ============================================================
     STEP NAVIGATION & VALIDATION
  ============================================================ */

  const handleNext = () => {
    setError("");

    // if (step === 1) {
    //   if (!customerName.trim()) return setError("Enter customer name");
    //   if (!/^\d{10}$/.test(mobile))
    //     return setError("Enter valid mobile number");
    //   if (!carNumber.trim()) return setError("Enter car number");
    //   if (!carModel.trim()) return setError("Enter car model");
    // }
    // if (step === 2) {
    //   if (problems.length === 0) return setError("Select at least one problem");
    //   if (problems.includes("other") && !otherProblem.trim())
    //     return setError("Describe other problem");
    // }

    setStep((prev) => prev + 1);
  };


  /* ============================================================
     DATABASE HELPERS
  ============================================================ */

  const getOrCreateCustomer = async () => {
    const { data } = await supabase
      .from("customers")
      .select("id")
      .eq("mobile", mobile)
      .single();

    if (data) return data.id;

    const { data: created } = await supabase
      .from("customers")
      .insert({ name: customerName, mobile })
      .select()
      .single();

    return created?.id;
  };

  const getOrCreateCar = async (customerId: string) => {
    const { data } = await supabase
      .from("cars")
      .select("id")
      .eq("car_number", carNumber)
      .single();

    if (data) return data.id;

    const { data: created } = await supabase
      .from("cars")
      .insert({
        customer_id: customerId,
        car_number: carNumber,
        car_model: carModel,
      })
      .select()
      .single();

    return created?.id;
  };

  const fetchCarDetails = async () => {
    if (!carNumber.trim()) return;

    try {
      setFetchingCar(true);

      const { data, error } = await supabase
        .from("cars")
        .select("car_model, customers(name, mobile)")
        .eq("car_number", carNumber)
        .single();

      if (error || !data) {
        Alert.alert("Not Found", "Car not found. Please enter details.");
        return;
      }

      setCarModel(data.car_model || "");
      // @ts-ignore
      setCustomerName(data.customers?.name || "");
      // @ts-ignore
      setMobile(data.customers?.mobile || "");

      Alert.alert("Success", "Customer details fetched ✅");
    } finally {
      setFetchingCar(false);
    }
  };

  /* ============================================================
   BILL SUBMISSION LOGIC
============================================================ */

  const handleGenerate = async () => {
    setError("");

    try {
      setLoading(true);

      const customerId = await getOrCreateCustomer();
      const carId = await getOrCreateCar(customerId);

      const servicePayload = Object.entries(services).map(
        ([serviceId, service]) => ({
          service_id: serviceId,
          service_charge: service.service_charge,
          parts: service.parts,
        })
      );

      const { bill_id, invoice_no, total_amount } =
        await generateBill({
          customer_id: customerId,
          car_id: carId,
          problems: problems.map((p) =>
            p === "other"
              ? otherProblem
              : problemsList.find((x) => x.id === p)?.name || ""
          ),
          services: servicePayload,
          labor_charge: Number(laborCharge) || 0,
          extra_charge: Number(extraCharge) || 0,
          remarks,
        });

      await generateBillPDF({
        billId: bill_id,
        invoiceNo: invoice_no,
        customerName,
        mobile,
        carNumber,
        carModel,
      });

      resetForm();

      Alert.alert("Success", `Invoice ${invoice_no} Generated ✅`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate bill");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FORM RESET
  ============================================================ */

  const resetForm = () => {
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
    setError("");
  };


  /* ============================================================
     PREVIEW TOTAL CALCULATION (Frontend Estimate Only)
  ============================================================ */

  const calculatePreviewTotal = () => {
    const servicesTotal = Object.values(services).reduce(
      (total, service) => {
        const partsTotal = service.parts.reduce(
          (sum, part) =>
            sum + part.quantity * part.price_per_unit,
          0
        );

        return total + service.service_charge + partsTotal;
      },
      0
    );

    return (
      servicesTotal +
      (Number(laborCharge) || 0) +
      (Number(extraCharge) || 0)
    );
  };


  /* ============================================================
     BILLING OVERVIEW RENDER
  ============================================================ */

  const renderOverview = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>
          Billing Overview
        </Text>

        <Text>Car: {carNumber}</Text>
        <Text>Customer: {customerName}</Text>

        {/* Problems */}
        <Text style={{ marginTop: 6, fontWeight: "600" }}>
          Problems:
        </Text>
        {problems.map((p, index) => (
          <Text key={index}>
            -{" "}
            {p === "other"
              ? otherProblem
              : problemsList.find((x) => x.id === p)?.name}
          </Text>
        ))}

        {/* Services */}
        <Text style={{ marginTop: 6, fontWeight: "600" }}>
          Services:
        </Text>

        {Object.entries(services).map(
          ([serviceId, service]) => {
            const serviceName =
              servicesList.find(
                (s) => s.id === serviceId
              )?.service_name || "";

            return (
              <View
                key={serviceId}
                style={{ marginBottom: 4 }}
              >
                <Text>
                  • {serviceName} (₹{service.service_charge})
                </Text>

                {service.parts.map((part, idx) => (
                  <Text
                    key={idx}
                    style={{ marginLeft: 10 }}
                  >
                    - {part.variant_name} | Qty{" "}
                    {part.quantity} | ₹
                    {part.price_per_unit}
                  </Text>
                ))}
              </View>
            );
          }
        )}

        <Text style={{ marginTop: 6 }}>
          Labor: ₹{laborCharge || 0}
        </Text>

        <Text>
          Extra: ₹{extraCharge || 0}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.screen}>
      {/* Steps */}
      <View style={styles.steps}>
        {[1, 2, 3, 4].map((n) => (
          <View key={n} style={[styles.step, step >= n && styles.stepActive]}>
            <Text style={styles.stepText}>{n}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* STEP 1 */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.title}>Car Details</Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              placeholder="Car Number"
              value={carNumber}
              onChangeText={setCarNumber}
              style={[styles.input, { flex: 1 }]}
            />

            <Pressable
              onPress={fetchCarDetails}
              style={{
                backgroundColor: "#2563eb",
                paddingHorizontal: 14,
                justifyContent: "center",
                borderRadius: 8,
              }}
              disabled={fetchingCar}
            >
              <Text style={{ color: "#fff" }}>
                {fetchingCar ? "..." : "Fetch"}
              </Text>
            </Pressable>
          </View>

          <TextInput
            placeholder="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
            style={styles.input}
          />

          <TextInput
            placeholder="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            placeholder="Car Model"
            value={carModel}
            onChangeText={setCarModel}
            style={styles.input}
          />
        </View>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.title}>Problems</Text>

          {problemsList.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => toggleProblem(p.id)}
              style={[
                styles.option,
                problems.includes(p.id) && styles.optionActive,
              ]}
            >
              <Text>{p.name}</Text>
            </Pressable>
          ))}

          {problems.includes("other") && (
            <TextInput
              placeholder="Describe other problem"
              value={otherProblem}
              onChangeText={setOtherProblem}
              style={styles.input}
            />
          )}
        </View>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.title}>Services & Pricing</Text>

          {servicesList.map((s) => {
            const selected = services[s.id];

            return (
              <View key={s.id} style={{ marginBottom: 16 }}>
                {/* Service Toggle */}
                <Pressable
                  onPress={() => toggleService(s.id)}
                  style={[
                    styles.option,
                    selected && styles.optionActive,
                  ]}
                >
                  <Text>{s.service_name}</Text>
                </Pressable>

                {/* If Selected */}
                {selected && (
                  <View style={{ marginTop: 8 }}>

                    {/* Service Charge */}
                    <TextInput
                      placeholder="Service Charge (optional)"
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
                            ...prev[s.id],
                            service_charge: Number(v) || 0,
                          },
                        }))
                      }
                      style={styles.input}
                    />

                    {/* Parts List */}
                    {selected.parts.map((part, index) => (
                      <View key={index} style={{ marginBottom: 8 }}>
                        <Text>
                          {part.variant_name} | Qty: {part.quantity} | ₹{part.price_per_unit}
                        </Text>

                        <Pressable
                          onPress={() =>
                            setServices((prev) => {
                              const updated = [...prev[s.id].parts];
                              updated.splice(index, 1);
                              return {
                                ...prev,
                                [s.id]: { ...prev[s.id], parts: updated },
                              };
                            })
                          }
                          style={{
                            backgroundColor: "#ef4444",
                            padding: 6,
                            borderRadius: 6,
                            marginTop: 4,
                          }}
                        >
                          <Text style={{ color: "#fff", textAlign: "center" }}>
                            Remove
                          </Text>
                        </Pressable>
                      </View>
                    ))}

                    {/* Add Part Button */}
                    <Pressable
                      onPress={() => {
                        setActiveServiceId(s.id);
                        setSelectedProduct(null);
                        setPartModalVisible(true);
                      }}
                      style={{
                        backgroundColor: "#16a34a",
                        padding: 8,
                        borderRadius: 6,
                        marginTop: 6,
                      }}
                    >
                      <Text style={{ color: "#fff", textAlign: "center" }}>
                        + Add Part
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {step === 4 && (
        <View style={styles.card}>
          {renderOverview()}

          <View
            style={{
              marginBottom: 15,
              padding: 10,
              backgroundColor: "#fef9c3",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16 }}>
              Preview Total: ₹{calculatePreviewTotal()}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              (Final amount will be calculated by system)
            </Text>
          </View>

          <Text style={styles.title}>Final Charges</Text>

          <TextInput
            placeholder="Labor Charge"
            keyboardType="numeric"
            value={laborCharge}
            onChangeText={setLaborCharge}
            style={styles.input}
          />

          <TextInput
            placeholder="Extra Charge"
            keyboardType="numeric"
            value={extraCharge}
            onChangeText={setExtraCharge}
            style={styles.input}
          />

          <TextInput
            placeholder="Remarks"
            value={remarks}
            onChangeText={setRemarks}
            style={styles.input}
            multiline
          />
        </View>
      )}

      {/* Navigation */}
      <View style={styles.nav}>
        {step > 1 && (
          <Pressable onPress={() => setStep(step - 1)}>
            <Text>Previous</Text>
          </Pressable>
        )}

        {step < 4 ? (
          <Pressable onPress={handleNext}>
            <Text>Next</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleGenerate} disabled={loading}>
            <Text>{loading ? "Processing..." : "Generate Bill"}</Text>
          </Pressable>
        )}
      </View>

      {/* INVENTORY MODAL */}
      <Modal visible={partModalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 16 }}>

          {/* Breadcrumb */}
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            {!selectedProduct && "Select Product"}
            {selectedProduct && !selectedVariant &&
              `Product > ${selectedProduct.name}`}
            {selectedVariant &&
              `Product > ${selectedProduct?.name} > ${selectedVariant.variant_name}`}
          </Text>

          {/* PRODUCTS */}
          {!selectedProduct &&
            products.map((p) => (
              <Pressable
                key={p.id}
                onPress={async () => {
                  setSelectedProduct(p);

                  const { data } = await supabase
                    .from("inventory_variants")
                    .select("id, variant_name")
                    .eq("product_id", p.id);

                  if (data) setProductVariants(data);
                }}
                style={styles.option}
              >
                <Text>{p.name}</Text>
              </Pressable>
            ))}

          {/* VARIANTS */}
          {selectedProduct && !selectedVariant &&
            productVariants.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => {
                  setSelectedVariant(v);
                }}
                style={styles.option}
              >
                <Text>{v.variant_name}</Text>
              </Pressable>
            ))}

          {/* QUANTITY + PRICE INPUT */}
          {selectedVariant && (
            <View>
              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                value={modalQuantity}
                onChangeText={setModalQuantity}
                style={styles.input}
              />

              <TextInput
                placeholder="Price Per Unit"
                keyboardType="numeric"
                value={modalPrice}
                onChangeText={setModalPrice}
                style={styles.input}
              />

              <Pressable
                onPress={() => {
                  if (!activeServiceId || !selectedVariant) return;

                  setServices((prev) => ({
                    ...prev,
                    [activeServiceId]: {
                      ...prev[activeServiceId],
                      parts: [
                        ...prev[activeServiceId].parts,
                        {
                          inventory_variant_id: selectedVariant.id,
                          variant_name: selectedVariant.variant_name,
                          quantity: Number(modalQuantity) || 1,
                          price_per_unit: Number(modalPrice) || 0,
                        },
                      ],
                    },
                  }));

                  // Reset modal
                  setSelectedProduct(null);
                  setSelectedVariant(null);
                  setModalQuantity("1");
                  setModalPrice("");
                  setPartModalVisible(false);
                }}
                style={{
                  backgroundColor: "#16a34a",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Add Part
                </Text>
              </Pressable>
            </View>
          )}

          {/* BACK BUTTON */}
          {(selectedProduct || selectedVariant) && (
            <Pressable
              onPress={() => {
                if (selectedVariant) {
                  setSelectedVariant(null);
                } else {
                  setSelectedProduct(null);
                }
              }}
              style={{
                marginTop: 15,
                padding: 8,
                backgroundColor: "#e5e7eb",
                borderRadius: 6,
              }}
            >
              <Text style={{ textAlign: "center" }}>Back</Text>
            </Pressable>
          )}

          {/* CLOSE */}
          <Pressable
            onPress={() => {
              setPartModalVisible(false);
              setSelectedProduct(null);
              setSelectedVariant(null);
            }}
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: "#ef4444",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Close
            </Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  steps: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },

  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  stepActive: { backgroundColor: "#2563eb" },

  stepText: { color: "#fff" },

  error: {
    color: "#b91c1c",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
  },

  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  option: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 8,
  },

  optionActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#2563eb",
  },

  total: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
});
