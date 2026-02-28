// ============================
// Step3Services.tsx
// ============================

import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Option } from "./BillingCommon";
import { Service, SelectedService, PartItem } from "../types/billing.types";

type Props = {
    servicesList: Service[];
    services: Record<string, SelectedService>;
    setServices: React.Dispatch<
        React.SetStateAction<Record<string, SelectedService>>
    >;
    toggleService: (id: string) => void;
    setActiveServiceId: (id: string | null) => void;
    setModalVisible: (v: boolean) => void;
};

export default function Step3Services({
    servicesList,
    services,
    setServices,
    toggleService,
    setActiveServiceId,
    setModalVisible,
}: Props) {
    return (
        <View>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 14 }}>
                Services Performed
            </Text>

            {servicesList.map((s) => {
                const selected = services[s.id];

                return (
                    <View key={s.id} style={{ marginBottom: 16 }}>
                        <Option
                            label={s.service_name}
                            active={!!selected}
                            onPress={() => toggleService(s.id)}
                        />

                        {selected && (
                            <View style={{ marginTop: 14 }}>
                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#e5e7eb",
                                        borderRadius: 8,
                                        padding: 12,
                                        marginBottom: 10,
                                    }}
                                    placeholder="Service Charge"
                                    keyboardType="numeric"
                                    value={
                                        selected.service_charge
                                            ? String(selected.service_charge)
                                            : ""
                                    }
                                    onChangeText={(v) =>
                                        setServices((prev) => ({
                                            ...prev,
                                            [s.id]: {
                                                ...(prev[s.id] ?? {
                                                    service_charge: 0,
                                                    parts: [],
                                                }),
                                                service_charge: Number(v) || 0,
                                            },
                                        }))
                                    }
                                />

                                {selected.parts.map((p: PartItem, i: number) => (
                                    <View
                                        key={i}
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            marginBottom: 6,
                                        }}
                                    >
                                        <Text>
                                            {p.variant_name} × {p.quantity}
                                        </Text>
                                        <Text>₹{p.price_per_unit}</Text>
                                    </View>
                                ))}

                                <Pressable
                                    style={{
                                        marginTop: 8,
                                        padding: 10,
                                        backgroundColor: "#e0f2fe",
                                        borderRadius: 8,
                                    }}
                                    onPress={() => {
                                        setActiveServiceId(s.id);
                                        setModalVisible(true);
                                    }}
                                >
                                    <Text style={{ color: "#2563eb" }}>＋ Add Part</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}