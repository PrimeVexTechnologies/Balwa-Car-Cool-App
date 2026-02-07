import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/* ---------------- DUMMY DATA ---------------- */

const dummyInventory = [
  { id: "1", name: "AC Gas Can", quantity: 12, unit: "pcs" },
  { id: "2", name: "Compressor", quantity: 4, unit: "pcs" },
  { id: "3", name: "Cooling Coil", quantity: 7, unit: "pcs" },
  { id: "4", name: "O-Ring Set", quantity: 30, unit: "pcs" },
];

/* ---------------- SCREEN ---------------- */

export default function InventoryScreen() {
  const [items, setItems] = useState(dummyInventory);

  return (
    <ScrollView style={styles.screen}>
      {/* Header Action */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Inventory</Text>
        <Pressable style={styles.addBtn}>
          <Text style={styles.addText}>+ Add Item</Text>
        </Pressable>
      </View>

      {/* List */}
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.qty}>
                Available: {item.quantity} {item.unit}
              </Text>
            </View>

            <Pressable style={styles.updateBtn}>
              <Text style={styles.updateText}>Update</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  topBar: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  addBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
  },

  list: {
    padding: 16,
    gap: 12,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  qty: {
    fontSize: 13,
    color: "#64748b",
  },

  updateBtn: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  updateText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
