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
  StyleSheet,
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
    <View style={styles.container}>
      <Text style={styles.title}>🚗 Vehicle Details</Text>

      {step1Error !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{step1Error}</Text>
        </View>
      )}

      {/* Car Number + Search */}
      <View style={styles.row}>
        <TextInput
          style={styles.carInput}
          placeholder="Car Number"
          placeholderTextColor="#9ca3af"
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

        <Pressable style={styles.searchBtn} onPress={fetchCarDetails}>
          {fetchingCar ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchIcon}>🔍</Text>
          )}
        </Pressable>
      </View>

      {/* Customer Name */}
      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        placeholderTextColor="#9ca3af"
        value={vehicleForm.customerName}
        onChangeText={(v) =>
          setVehicleForm((p: any) => ({ ...p, customerName: v }))
        }
      />

      {/* Mobile */}
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        maxLength={10}
        value={vehicleForm.mobile}
        onChangeText={(v) =>
          setVehicleForm((p: any) => ({ ...p, mobile: v }))
        }
      />

      {/* Car Model */}
      <TextInput
        style={styles.input}
        placeholder="Car Model"
        placeholderTextColor="#9ca3af"
        value={vehicleForm.carModel}
        onChangeText={(v) =>
          setVehicleForm((p: any) => ({ ...p, carModel: v }))
        }
      />
    </View>
  );
}

const INPUT_HEIGHT = 48;

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

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  carInput: {
    flex: 1,
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },

  searchBtn: {
    height: INPUT_HEIGHT,
    width: 48,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  searchIcon: {
    color: "#fff",
    fontSize: 16,
  },

  input: {
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#fafafa",
    marginBottom: 14,
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 13,
  },
});