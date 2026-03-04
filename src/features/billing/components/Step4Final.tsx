// ============================
// Step4Final.tsx
// ============================

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

type Props = {
  previewTotal: number;
  laborCharge: string;
  extraCharge: string;
  remarks: string;
  setLaborCharge: (v: string) => void;
  setExtraCharge: (v: string) => void;
  setRemarks: (v: string) => void;
};

export default function Step4Final({
  previewTotal,
  laborCharge,
  extraCharge,
  remarks,
  setLaborCharge,
  setExtraCharge,
  setRemarks,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Final Charges</Text>

      {/* Preview Total */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Preview Total</Text>
        <Text style={styles.totalValue}>₹{previewTotal}</Text>
      </View>

      {/* Labor Charge */}
      <TextInput
        style={styles.input}
        placeholder="Labor Charge"
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
        value={laborCharge}
        onChangeText={setLaborCharge}
      />

      {/* Extra Charge */}
      <TextInput
        style={styles.input}
        placeholder="Extra Charge"
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
        value={extraCharge}
        onChangeText={setExtraCharge}
      />

      {/* Remarks */}
      <TextInput
        style={styles.remarksInput}
        placeholder="Remarks"
        placeholderTextColor="#9ca3af"
        multiline
        value={remarks}
        onChangeText={setRemarks}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },

  totalBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  totalLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },

  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    fontSize: 14,
  },

  remarksInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fafafa",
    fontSize: 14,
    height: 100,
    textAlignVertical: "top",
  },
});