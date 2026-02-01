import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const Contact = () => {
    return (
        <View style={styles.section}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.heading}>Contact Us</Text>
                    <Text style={styles.subheading}>
                        Visit our garage or get in touch for any inquiries
                    </Text>
                </View>

                {/* Contact Cards */}
                <View style={styles.cards}>
                    {/* Address */}
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.iconBox}>
                                <Feather name="map-pin" size={22} color="#2563eb" />
                            </View>
                            <View style={styles.textBlock}>
                                <Text style={styles.cardTitle}>Address</Text>
                                <Text style={styles.cardText}>Balwa Car Cool, Main Road,</Text>
                                <Text style={styles.cardText}>Your City, State - 123456</Text>
                            </View>
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.iconBox}>
                                <Feather name="phone" size={22} color="#2563eb" />
                            </View>
                            <View style={styles.textBlock}>
                                <Text style={styles.cardTitle}>Phone</Text>
                                <Text style={styles.cardText}>+91 98765 43210</Text>
                                <Text style={styles.cardText}>+91 98765 43211</Text>
                            </View>
                        </View>
                    </View>

                    {/* Hours */}
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.iconBox}>
                                <Feather name="clock" size={22} color="#2563eb" />
                            </View>
                            <View style={styles.textBlock}>
                                <Text style={styles.cardTitle}>Working Hours</Text>
                                <Text style={styles.cardText}>
                                    Monday - Saturday: 9:00 AM - 7:00 PM
                                </Text>
                                <Text style={styles.cardText}>Sunday: Closed</Text>
                            </View>
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.iconBox}>
                                <Feather name="mail" size={22} color="#2563eb" />
                            </View>
                            <View style={styles.textBlock}>
                                <Text style={styles.cardTitle}>Email</Text>
                                <Text style={styles.cardText}>
                                    balwacarcool@email.com
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Map Placeholder */}
                    <View style={[styles.card, styles.mapCard]}>
                        <View style={styles.mapPlaceholder}>
                            <Feather
                                name="map-pin"
                                size={48}
                                color="#94a3b8"
                                style={{ marginBottom: 12 }}
                            />
                            <Text style={styles.mapText}>Map Location</Text>
                            <Text style={styles.mapSubText}>
                                Google Maps integration available
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default Contact;

const styles = StyleSheet.create({
    section: {
        paddingVertical: 64,
        backgroundColor: "#f1f5f9",
    },

    container: {
        paddingHorizontal: 24,
    },

    header: {
        alignItems: "center",
        marginBottom: 40,
    },

    heading: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 8,
        textAlign: "center",
    },

    subheading: {
        fontSize: 16,
        color: "#475569",
        textAlign: "center",
        maxWidth: 360,
    },

    cards: {
        gap: 16,
    },

    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },

    row: {
        flexDirection: "row",
        gap: 16,
        alignItems: "flex-start",
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#e0f2fe",
        alignItems: "center",
        justifyContent: "center",
    },

    textBlock: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },

    cardText: {
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
    },

    mapCard: {
        padding: 8,
    },

    mapPlaceholder: {
        height: 220,
        backgroundColor: "#e5e7eb",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    mapText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#475569",
    },

    mapSubText: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4,
    },
});
