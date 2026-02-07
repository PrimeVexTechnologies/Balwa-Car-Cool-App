import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Footer = () => {
    return (
        <View style={styles.footer}>
            <View style={styles.container}>
                {/* Brand */}
                <View style={styles.brand}>
                    <MaterialCommunityIcons name="snowflake" size={18} color="#ffffff" />
                    <Text style={styles.brandText}>Balwa Car Cool</Text>
                </View>

                {/* Copyright */}
                <Text style={styles.text}>
                    © {new Date().getFullYear()} Balwa Car Cool. All rights reserved.
                </Text>

                {/* Phone */}
                <Text style={styles.text}>+91 98765 43210</Text>
            </View>
        </View>
    );
};

export default Footer;

const styles = StyleSheet.create({
    footer: {
        backgroundColor: "#0f172a",
        paddingVertical: 24,
    },

    container: {
        paddingHorizontal: 24,
        alignItems: "center",
        gap: 8,
    },

    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    brandText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },

    text: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        textAlign: "center",
    },
});
