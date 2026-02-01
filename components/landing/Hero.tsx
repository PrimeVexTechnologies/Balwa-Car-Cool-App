import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Hero = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Badge */}
            <View style={styles.badge}>
                <MaterialCommunityIcons name="snowflake" size={18} color="#ffffff" />
                <Text style={styles.badgeText}>Professional Car Care</Text>
            </View>

            {/* Heading */}
            <Text style={styles.title}>Balwa Car Cool</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                Car A/C & Auto Electrical Specialist
            </Text>

            {/* Tagline */}
            <Text style={styles.tagline}>
                Expert cooling solutions and electrical repairs for your vehicle.
                Trusted service since years.
            </Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <Pressable
                    style={[styles.button, styles.primaryButton]}
                    onPress={() => router.push("/login")}
                >
                    <MaterialCommunityIcons name="snowflake" size={18} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>Admin Login</Text>
                </Pressable>

                <Pressable style={[styles.button, styles.outlineButton]}>
                    <Text style={styles.outlineButtonText}>Contact Us</Text>
                </Pressable>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>500+</Text>
                    <Text style={styles.statLabel}>Cars Serviced</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>10+</Text>
                    <Text style={styles.statLabel}>Years Experience</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>100%</Text>
                    <Text style={styles.statLabel}>Satisfaction</Text>
                </View>
            </View>
        </View>
    );
};

export default Hero;

const styles = StyleSheet.create({
    container: {
        minHeight: 500,
        paddingVertical: 48,
        paddingHorizontal: 24,
        alignItems: "center",
        backgroundColor: "#ffffff",
    },

    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#e0f2fe",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 24,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#0f172a",
    },

    title: {
        fontSize: 36,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center",
        marginBottom: 12,
    },

    subtitle: {
        fontSize: 20,
        color: "#475569",
        marginBottom: 8,
        textAlign: "center",
    },

    tagline: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
        maxWidth: 320,
        marginBottom: 32,
    },

    buttonRow: {
        width: "100%",
        gap: 12,
        alignItems: "center",
        marginBottom: 40,
    },

    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        width: "100%",
        justifyContent: "center",
    },

    primaryButton: {
        backgroundColor: "#2563eb",
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },

    outlineButton: {
        borderWidth: 1,
        borderColor: "#cbd5f5",
    },
    outlineButtonText: {
        color: "#2563eb",
        fontSize: 16,
        fontWeight: "600",
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 320,
    },

    stat: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2563eb",
    },
    statLabel: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
        textAlign: "center",
    },
});
