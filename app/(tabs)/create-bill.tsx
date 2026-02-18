import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

/* ---------------- STATIC DATA ---------------- */

const problemsList = [
  { id: "ac-not-cooling", label: "A/C Not Cooling" },
  { id: "gas-leakage", label: "Gas Leakage" },
  { id: "compressor-issue", label: "Compressor Issue" },
  { id: "electrical-problem", label: "Electrical Problem" },
  { id: "cooling-issue", label: "Cooling Issue" },
  { id: "other", label: "Other" },
];

/* ---------------- TYPES ---------------- */

type Service = {
  id: string;
  service_name: string;
};

/* ---------------- SCREEN ---------------- */

export default function CreateBillScreen() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [carModel, setCarModel] = useState("");

  // Problems
  const [problems, setProblems] = useState<string[]>([]);
  const [otherProblem, setOtherProblem] = useState("");

  // Services
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [services, setServices] = useState<Record<string, number>>({});
  const [otherWork, setOtherWork] = useState("");
  const [otherPrice, setOtherPrice] = useState(0);

  const total =
    Object.values(services).reduce((s, v) => s + v, 0) + (otherPrice || 0);

  /* ---------------- FETCH SERVICES ---------------- */

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("id, service_name")
        .eq("is_active", true)
        .order("service_name");

      if (data) setServicesList(data);
    };

    fetchServices();
  }, []);

  /* ---------------- HELPERS ---------------- */

  const toggleProblem = (id: string) => {
    setProblems((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  };

  const toggleService = (id: string, price: number) => {
    setServices((s) =>
      s[id] !== undefined
        ? Object.fromEntries(Object.entries(s).filter(([k]) => k !== id))
        : { ...s, [id]: price },
    );
  };

  /* ---------------- VALIDATION ---------------- */

  const handleNext = () => {
    setError("");

    if (step === 1) {
      if (!customerName.trim()) return setError("Enter customer name");
      if (!/^\d{10}$/.test(mobile))
        return setError("Enter valid mobile number");
      if (!carNumber.trim()) return setError("Enter car number");
      if (!carModel.trim()) return setError("Enter car model");
    }

    if (step === 2) {
      if (problems.length === 0) return setError("Select at least one problem");
      if (problems.includes("other") && !otherProblem.trim())
        return setError("Describe other problem");
    }

    setStep(step + 1);
  };

  /* ---------------- DB HELPERS ---------------- */

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

    return created.id;
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

    return created.id;
  };

  const generateInvoiceNo = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `BCC-${year}-${rand}`;
  };

  /* ---------------- PDF ---------------- */

  const buildHTML = (invoiceNo: string, items: any[]) => `
  <html>
    <body style="font-family: Arial; padding: 24px">
      <h2>Invoice ${invoiceNo}</h2>

      <p><b>${customerName}</b> (${mobile})</p>
      <p>${carNumber} • ${carModel}</p>

      <hr/>

      <table width="100%" border="1" cellspacing="0" cellpadding="8">
        <tr>
          <th align="left">Service</th>
          <th align="right">Price</th>
        </tr>

        ${items
          .map(
            (i) => `
          <tr>
            <td>${i.service_name}</td>
            <td align="right">₹${i.price}</td>
          </tr>
        `,
          )
          .join("")}
      </table>

      <h3 style="text-align:right">Total ₹${total}</h3>
    </body>
  </html>
`;

  const generateAndUploadPDF = async (
    billId: string,
    invoiceNo: string,
    items: any[],
  ) => {
    // 1. Generate PDF
    const html = buildHTML(invoiceNo, items);

    const { uri } = await Print.printToFileAsync({ html });

    // 2. Upload using Expo (CORRECT WAY)
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

    const uploadUrl = `${supabaseUrl}/storage/v1/object/invoices/${invoiceNo}.pdf`;

    const upload = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/pdf",
      },
    });

    if (upload.status !== 200) {
      console.log(upload.body);
      throw new Error("Upload failed");
    }

    // 3. Public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/invoices/${invoiceNo}.pdf`;

    // 4. Save in DB
    await supabase.from("bill_files").insert({
      bill_id: billId,
      pdf_url: publicUrl,
    });
  };

  /* ---------------- GENERATE ---------------- */

  const handleGenerate = async () => {
    setError("");

    try {
      setLoading(true);

      const customerId = await getOrCreateCustomer();
      const carId = await getOrCreateCar(customerId);

      const invoiceNo = generateInvoiceNo();

      const { data: bill } = await supabase
        .from("bills")
        .insert({
          invoice_no: invoiceNo,
          customer_id: customerId,
          car_id: carId,
          total_amount: total,
        })
        .select()
        .single();

      const problemRows = problems.map((p) => ({
        bill_id: bill.id,
        problem_name:
          p === "other"
            ? otherProblem
            : problemsList.find((x) => x.id === p)?.label,
      }));

      await supabase.from("problems").insert(problemRows);

      const itemRows: any[] = [];

      for (const id in services) {
        const s = servicesList.find((x) => x.id === id);

        if (s)
          itemRows.push({
            bill_id: bill.id,
            service_name: s.service_name,
            price: services[id],
          });
      }

      if (otherWork)
        itemRows.push({
          bill_id: bill.id,
          service_name: otherWork,
          price: otherPrice,
        });

      await supabase.from("bill_items").insert(itemRows);

      await generateAndUploadPDF(bill.id, invoiceNo, itemRows);

      resetForm();

      Alert.alert("Success", "Bill & Invoice Generated ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to generate bill");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESET ---------------- */

  const resetForm = () => {
    setStep(1);
    setCustomerName("");
    setMobile("");
    setCarNumber("");
    setCarModel("");
    setProblems([]);
    setOtherProblem("");
    setServices({});
    setOtherWork("");
    setOtherPrice(0);
    setError("");
  };

  /* ---------------- UI ---------------- */

  return (
    <ScrollView style={styles.screen}>
      {/* Steps */}
      <View style={styles.steps}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={[styles.step, step >= n && styles.stepActive]}>
            <Text style={styles.stepText}>{n}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* STEP 1 */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.title}>Customer Details</Text>

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
            placeholder="Car Number"
            value={carNumber}
            onChangeText={setCarNumber}
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
              <Text>{p.label}</Text>
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
          <Text style={styles.title}>Work & Pricing</Text>

          {servicesList.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => toggleService(s.id, 0)}
              style={[
                styles.option,
                services[s.id] !== undefined && styles.optionActive,
              ]}
            >
              <Text>{s.service_name}</Text>
            </Pressable>
          ))}

          <TextInput
            placeholder="Other Work"
            value={otherWork}
            onChangeText={setOtherWork}
            style={styles.input}
          />

          <TextInput
            placeholder="Price"
            value={otherPrice ? String(otherPrice) : ""}
            onChangeText={(v) => setOtherPrice(Number(v))}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.total}>Total: ₹{total}</Text>
        </View>
      )}

      {/* Navigation */}
      <View style={styles.nav}>
        {step > 1 && (
          <Pressable onPress={() => setStep(step - 1)}>
            <Text>Previous</Text>
          </Pressable>
        )}

        {step < 3 ? (
          <Pressable onPress={handleNext}>
            <Text>Next</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleGenerate} disabled={loading}>
            <Text>{loading ? "Processing..." : "Generate Bill"}</Text>
          </Pressable>
        )}
      </View>
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
