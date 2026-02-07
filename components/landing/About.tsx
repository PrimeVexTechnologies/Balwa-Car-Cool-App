import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const About = () => {
    return (
        <View style={styles.section}>
            <View style={styles.container}>
                <Text style={styles.heading}>About Our Garage</Text>

                <Text style={styles.description}>
                    Balwa Car Cool is your trusted destination for all car A/C and
                    electrical needs. With years of hands-on experience, we provide
                    reliable, affordable, and quality service to keep your vehicle
                    running cool and smooth. Our skilled technicians use modern equipment
                    to diagnose and fix problems efficiently.
                </Text>

                {/* Features */}
                <View style={styles.features}>
                    <View style={styles.card}>
                        <View style={styles.iconBox}>
                            <Feather name="shield" size={22} color="#2563eb" />
                        </View>
                        <Text style={styles.cardTitle}>Trusted Service</Text>
                        <Text style={styles.cardText}>
                            Quality repairs backed by our commitment to excellence
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.iconBox}>
                            <Feather name="clock" size={22} color="#2563eb" />
                        </View>
                        <Text style={styles.cardTitle}>Quick Turnaround</Text>
                        <Text style={styles.cardText}>
                            Fast diagnostics and efficient repair service
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.iconBox}>
                            <Feather name="award" size={22} color="#2563eb" />
                        </View>
                        <Text style={styles.cardTitle}>Expert Team</Text>
                        <Text style={styles.cardText}>
                            Skilled technicians with years of experience
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default About;

const styles = StyleSheet.create({
    section: {
        paddingVertical: 64,
        backgroundColor: "#f1f5f9",
    },

    container: {
        paddingHorizontal: 24,
        alignItems: "center",
    },

    heading: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 20,
        textAlign: "center",
    },

    description: {
        fontSize: 16,
        color: "#475569",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 40,
        maxWidth: 360,
    },

    features: {
        width: "100%",
        gap: 20,
    },

    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#e0f2fe",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 6,
        textAlign: "center",
    },

    cardText: {
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
    },
});
