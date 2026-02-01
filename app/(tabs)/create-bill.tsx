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

/* ---------------- DATA ---------------- */

const problemsList = [
    { id: "ac-not-cooling", label: "A/C Not Cooling" },
    { id: "gas-leakage", label: "Gas Leakage" },
    { id: "compressor-issue", label: "Compressor Issue" },
    { id: "electrical-problem", label: "Electrical Problem" },
    { id: "cooling-issue", label: "Cooling Issue" },
    { id: "other", label: "Other" },
];

const servicesList = [
    { id: "servicing", label: "Servicing", price: 500 },
    { id: "leak-testing", label: "Leak Testing", price: 300 },
    { id: "oil-charging", label: "Oil Charging", price: 400 },
    { id: "gas-charging", label: "Gas Charging", price: 1500 },
    { id: "labour", label: "Labour Charge", price: 500 },
];

/* ---------------- SCREEN ---------------- */

export default function CreateBillScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Customer
    const [customerName, setCustomerName] = useState("");
    const [mobile, setMobile] = useState("");
    const [carNumber, setCarNumber] = useState("");
    const [carModel, setCarModel] = useState("");

    // Problems
    const [problems, setProblems] = useState<string[]>([]);
    const [otherProblem, setOtherProblem] = useState("");

    // Services
    const [services, setServices] = useState<Record<string, number>>({});
    const [otherWork, setOtherWork] = useState("");
    const [otherPrice, setOtherPrice] = useState(0);

    const total =
        Object.values(services).reduce((s, v) => s + v, 0) + (otherPrice || 0);

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
                    <Text style={styles.brandText}>Create Bill</Text>
                </View>

                <Pressable onPress={() => router.replace("/login")}>
                    <Feather name="log-out" size={18} />
                </Pressable>
            </View>

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
                            onPress={() => toggleService(s.id, s.price)}
                            style={[
                                styles.option,
                                services[s.id] !== undefined && styles.optionActive,
                            ]}
                        >
                            <Text>
                                {s.label} – ₹{services[s.id] ?? s.price}
                            </Text>
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
    header: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    brand: { flexDirection: "row", alignItems: "center", gap: 6 },
    brandText: { fontSize: 16, fontWeight: "600" },
    steps: { flexDirection: "row", justifyContent: "center", gap: 8 },
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
