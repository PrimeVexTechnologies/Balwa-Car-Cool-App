import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        // Success → go to dashboard
        router.replace("/dashboard");
    };

    return (
        <View style={styles.screen}>
            <View style={styles.card}>
                {/* Logo */}
                <View style={styles.logo}>
                    <View style={styles.logoIcon}>
                        <MaterialCommunityIcons
                            name="snowflake"
                            size={26}
                            color="#ffffff"
                        />
                    </View>
                    <Text style={styles.logoText}>Balwa Car Cool</Text>
                </View>

                <Text style={styles.title}>Admin Login</Text>
                <Text style={styles.subtitle}>
                    Sign in to manage your garage
                </Text>

                {/* Email */}
                <TextInput
                    placeholder="admin@gmail.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    style={styles.input}
                />

                {/* Password */}
                <View style={styles.passwordRow}>
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[styles.input, { flex: 1 }]}
                    />
                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eye}
                    >
                        <Feather
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color="#64748b"
                        />
                    </Pressable>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                    onPress={handleLogin}
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        padding: 16,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    logo: {
        alignItems: "center",
        marginBottom: 16,
    },
    logoIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    logoText: {
        fontSize: 20,
        fontWeight: "700",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#64748b",
        textAlign: "center",
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    passwordRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    eye: {
        position: "absolute",
        right: 12,
    },
    button: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 16,
    },
    error: {
        color: "#b91c1c",
        marginBottom: 8,
        textAlign: "center",
    },
});
