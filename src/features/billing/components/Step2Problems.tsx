// ============================
// Step2Problems.tsx
// ============================

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Option } from "./BillingCommon";
import { Problem } from "../types/billing.types";

type Props = {
  problemsList: Problem[];
  problems: string[];
  otherProblem: string;
  setOtherProblem: (v: string) => void;
  toggleProblem: (id: string) => void;
};

export default function Step2Problems({
  problemsList,
  problems,
  otherProblem,
  setOtherProblem,
  toggleProblem,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reported Problems</Text>

      {problemsList.map((p) => (
        <Option
          key={p.id}
          label={p.name}
          active={problems.includes(p.id)}
          onPress={() => toggleProblem(p.id)}
        />
      ))}

      <Option
        label="Other"
        active={problems.includes("other")}
        onPress={() => toggleProblem("other")}
      />

      {problems.includes("other") && (
        <TextInput
          style={styles.input}
          placeholder="Describe the problem"
          placeholderTextColor="#9ca3af"
          value={otherProblem}
          onChangeText={setOtherProblem}
        />
      )}
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

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
    backgroundColor: "#fafafa",
    fontSize: 14,
  },
});