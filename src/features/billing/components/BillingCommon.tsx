// ============================
// BillingCommon.tsx
// ============================

import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export function PrimaryBtn({
    title,
    onPress,
    disabled,
}: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[styles.btn, disabled && { opacity: 0.6 }]}
        >
            <Text style={styles.btnText}>{title}</Text>
        </Pressable>
    );
}

export function Option({
    label,
    active,
    onPress,
}: {
    label: string;
    active?: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.option, active && styles.optionActive]}
        >
            <Text>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: "#2563eb",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 8,
    },
    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
    option: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        marginBottom: 10,
    },
    optionActive: {
        backgroundColor: "#e0f2fe",
        borderColor: "#2563eb",
    },
});