// ============================
// Step2Problems.tsx
// ============================

import React from "react";
import { View, Text, TextInput } from "react-native";
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
        <View>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 14 }}>
                Reported Problems
            </Text>

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
                    style={{
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 8,
                        padding: 12,
                        marginTop: 10,
                    }}
                    placeholder="Describe problem"
                    value={otherProblem}
                    onChangeText={setOtherProblem}
                />
            )}
        </View>
    );
}