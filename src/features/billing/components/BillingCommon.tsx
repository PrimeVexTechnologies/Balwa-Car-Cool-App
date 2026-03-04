// ============================
// BillingCommon.tsx
// ============================

import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export function PrimaryBtn({
  title,
  onPress,
  disabled,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        variant === "secondary" && styles.btnSecondary,
        pressed && !disabled && styles.btnPressed,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          variant === "secondary" && styles.btnTextSecondary,
        ]}
      >
        {title}
      </Text>
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
      style={[
        styles.option,
        active && styles.optionActive,
      ]}
    >
      <Text style={[styles.optionText, active && styles.optionTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // BUTTON
  btn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    marginTop: 12,
  },

  btnSecondary: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  btnPressed: {
    opacity: 0.9,
  },

  btnDisabled: {
    opacity: 0.5,
  },

  btnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },

  btnTextSecondary: {
    color: "#111827",
  },

  // OPTION
  option: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },

  optionActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },

  optionText: {
    fontSize: 14,
    color: "#111827",
  },

  optionTextActive: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
});