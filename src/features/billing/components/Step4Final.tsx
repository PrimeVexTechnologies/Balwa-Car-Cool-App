// ============================
// Step4Final.tsx
// ============================

import React from "react";
import { View, Text, TextInput } from "react-native";

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
        <View>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 14 }}>
                Final Charges
            </Text>

            <View
                style={{
                    backgroundColor: "#f1f5f9",
                    padding: 14,
                    borderRadius: 8,
                    marginBottom: 14,
                }}
            >
                <Text style={{ color: "#64748b" }}>Preview Total</Text>
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                    ₹{previewTotal}
                </Text>
            </View>

            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                }}
                placeholder="Labor Charge"
                keyboardType="numeric"
                value={laborCharge}
                onChangeText={setLaborCharge}
            />

            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                }}
                placeholder="Extra Charge"
                keyboardType="numeric"
                value={extraCharge}
                onChangeText={setExtraCharge}
            />

            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    height: 90,
                }}
                placeholder="Remarks"
                multiline
                value={remarks}
                onChangeText={setRemarks}
            />
        </View>
    );
}