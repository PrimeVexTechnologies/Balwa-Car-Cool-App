import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
} from "react-native";
import { supabase } from "@/lib/supabase";

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

    // Customer
    const [customerName, setCustomerName] = useState("");
    const [mobile, setMobile] = useState("");
    const [carNumber, setCarNumber] = useState("");
    const [carModel, setCarModel] = useState("");

    // Problems
    const [problems, setProblems] = useState<string[]>([]);
    const [otherProblem, setOtherProblem] = useState("");

    // Services (DB)
    const [servicesList, setServicesList] = useState<Service[]>([]);
    const [services, setServices] = useState<Record<string, number>>({});
    const [otherWork, setOtherWork] = useState("");
    const [otherPrice, setOtherPrice] = useState(0);

    const total =
        Object.values(services).reduce((s, v) => s + v, 0) + (otherPrice || 0);

    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase
                .from("services")
                .select("id, service_name")
                .eq("is_active", true)
                .order("service_name");

            if (!error && data) {
                setServicesList(data);
            }
        };

        fetchServices();
    }, []);

    const toggleProblem = (id: string) => {
        setProblems((p) =>
            p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
        );
    };

    const toggleService = (id: string, price: number) => {
        setServices((s) =>
            s[id] !== undefined
                ? Object.fromEntries(Object.entries(s).filter(([k]) => k !== id))
                : { ...s, [id]: price }
        );
    };

    /* ---------------- UI ---------------- */

    return (
        <ScrollView style={styles.screen}>
            {/* Step Indicator */}
            <View style={styles.steps}>
                {[1, 2, 3].map((n) => (
                    <View
                        key={n}
                        style={[styles.step, step >= n && styles.stepActive]}
                    >
                        <Text style={styles.stepText}>{n}</Text>
                    </View>
                ))}
            </View>

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
                                services[s.id] !== undefined &&
                                styles.optionActive,
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
                    <Pressable onPress={() => setStep(step + 1)}>
                        <Text>Next</Text>
                    </Pressable>
                ) : (
                    <Pressable>
                        <Text>Generate Bill</Text>
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
    optionActive: { backgroundColor: "#e0f2fe", borderColor: "#2563eb" },
    total: { fontSize: 20, fontWeight: "700", marginTop: 12 },
    nav: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
    },
});
