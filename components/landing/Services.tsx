import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const services = [
    {
        icon: "snowflake",
        title: "Car A/C Servicing",
        description: "Complete A/C system checkup and maintenance",
    },
    {
        icon: "wind",
        title: "Gas Charging",
        description: "Refrigerant recharge for optimal cooling",
    },
    {
        icon: "zap",
        title: "Electrical Work",
        description: "Auto electrical diagnosis and repairs",
    },
    {
        icon: "settings",
        title: "Compressor Repair",
        description: "A/C compressor repair and replacement",
    },
    {
        icon: "thermometer",
        title: "Cooling System Repair",
        description: "Cooling coil, condenser and pipe repairs",
    },
    {
        icon: "tool",
        title: "General Repairs",
        description: "Complete A/C component services",
    },
];

const Services = () => {
    return (
        <View style={styles.section}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.heading}>Our Services</Text>
                    <Text style={styles.subheading}>
                        Comprehensive car A/C and electrical solutions for all vehicle types
                    </Text>
                </View>

                {/* Services list */}
                <View style={styles.list}>
                    {services.map((service) => (
                        <View key={service.title} style={styles.card}>
                            <View style={styles.iconBox}>
                                <Feather name={service.icon as any} size={26} color="#2563eb" />
                            </View>

                            <Text style={styles.cardTitle}>{service.title}</Text>
                            <Text style={styles.cardText}>{service.description}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default Services;

const styles = StyleSheet.create({
    section: {
        paddingVertical: 64,
        backgroundColor: "#ffffff",
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

    list: {
        gap: 20,
    },

    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },

    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: "#e0f2fe",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    cardTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 6,
    },

    cardText: {
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
    },
});
