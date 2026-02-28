// ============================
// Step1Vehicle.tsx
// ============================

import React from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ActivityIndicator,
} from "react-native";

import { PrimaryBtn } from "./BillingCommon";

type Props = {
    vehicleForm: any;
    vehicleTouched: any;
    vehicleErrors: any;
    step1Error: string;
    fetchingCar: boolean;
    setVehicleForm: any;
    setVehicleTouched: any;
    validateVehicleField: (field: string, value: string) => boolean;
    fetchCarDetails: () => void;
};

export default function Step1Vehicle({
    vehicleForm,
    vehicleTouched,
    vehicleErrors,
    step1Error,
    fetchingCar,
    setVehicleForm,
    setVehicleTouched,
    validateVehicleField,
    fetchCarDetails,
}: Props) {
    return (
        <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 14 }}>
                Vehicle Details
            </Text>

            {step1Error !== "" && (
                <View
                    style={{
                        backgroundColor: "#fee2e2",
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ color: "#b91c1c" }}>{step1Error}</Text>
                </View>
            )}

            {/* Car Number */}
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 8,
                        padding: 12,
                    }}
                    placeholder="Car Number"
                    autoCapitalize="characters"
                    value={vehicleForm.carNumber}
                    onChangeText={(v) => {
                        setVehicleForm((p: any) => ({ ...p, carNumber: v }));
                        if (vehicleTouched.carNumber)
                            validateVehicleField("carNumber", v);
                    }}
                    onBlur={() => {
                        setVehicleTouched((p: any) => ({ ...p, carNumber: true }));
                        validateVehicleField("carNumber", vehicleForm.carNumber);
                    }}
                />

                <Pressable
                    style={{
                        backgroundColor: "#2563eb",
                        paddingHorizontal: 16,
                        justifyContent: "center",
                        borderRadius: 8,
                        marginLeft: 8,
                    }}
                    onPress={fetchCarDetails}
                >
                    {fetchingCar ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={{ color: "#fff" }}>🔍</Text>
                    )}
                </Pressable>
            </View>

            {/* Customer Name */}
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                }}
                placeholder="Customer Name"
                value={vehicleForm.customerName}
                onChangeText={(v) =>
                    setVehicleForm((p: any) => ({ ...p, customerName: v }))
                }
            />

            {/* Mobile */}
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                }}
                placeholder="Mobile Number"
                keyboardType="number-pad"
                maxLength={10}
                value={vehicleForm.mobile}
                onChangeText={(v) =>
                    setVehicleForm((p: any) => ({ ...p, mobile: v }))
                }
            />

            {/* Car Model */}
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                }}
                placeholder="Car Model"
                value={vehicleForm.carModel}
                onChangeText={(v) =>
                    setVehicleForm((p: any) => ({ ...p, carModel: v }))
                }
            />
        </View>
    );
}