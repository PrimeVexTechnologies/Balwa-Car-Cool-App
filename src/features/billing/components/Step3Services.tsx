// ============================
// Step3Services.tsx
// ============================

import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
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
    <View style={styles.container}>
      <Text style={styles.title}>Services Performed</Text>

      {servicesList.map((s) => {
        const selected = services[s.id];

        return (
          <View key={s.id} style={styles.serviceBlock}>
            <Option
              label={s.service_name}
              active={!!selected}
              onPress={() => toggleService(s.id)}
            />

            {selected && (
              <View style={styles.serviceDetails}>
                {/* Service Charge */}
                <TextInput
                  style={styles.input}
                  placeholder="Service Charge"
                  placeholderTextColor="#9ca3af"
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

                {/* Parts List */}
                {selected.parts.map((p: PartItem, i: number) => (
                  <View key={i} style={styles.partRow}>
                    <Text style={styles.partName}>
                      {p.variant_name} × {p.quantity}
                    </Text>

                    <Text style={styles.partPrice}>₹{p.price_per_unit}</Text>
                  </View>
                ))}

                {/* Add Part Button */}
                <Pressable
                  style={styles.addPartBtn}
                  onPress={() => {
                    setActiveServiceId(s.id);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.addPartText}>+ Add Part</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
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

  serviceBlock: {
    marginBottom: 18,
  },

  serviceDetails: {
    marginTop: 14,
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

  partRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  partName: {
    fontSize: 14,
    color: "#111827",
  },

  partPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },

  addPartBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  addPartText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
});