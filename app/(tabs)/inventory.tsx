<<<<<<< HEAD
import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from "react-native";

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
=======
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function InventoryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState("");
  const [variantName, setVariantName] = useState("");
  const [quantity, setQuantity] = useState("");

  const [editItem, setEditItem] = useState<any>(null);
  const [editQty, setEditQty] = useState("");

  /* ---------- FETCH INVENTORY ---------- */
  const fetchInventory = async () => {
    const { data } = await supabase.from("inventory_variants").select(`
      id,
      variant_name,
      quantity,
      inventory_products!inventory_variants_product_id_fkey (
        name
      )
    `);

    if (data) setItems(data);
  };

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    const { data } = await supabase
      .from("inventory_products")
      .select("id, name");

    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  /* ---------- GROUP INVENTORY ---------- */
  const groupedItems = items.reduce((acc: any, item: any) => {
    const productName = item.inventory_products?.name;
    if (!productName) return acc;

    if (!acc[productName]) acc[productName] = [];
    acc[productName].push(item);
    return acc;
  }, {});

  /* ---------- ADD ITEM ---------- */
  const saveItem = async () => {
    if (!productId || !variantName || !quantity) return;

    await supabase.from("inventory_variants").insert({
      product_id: productId,
      variant_name: variantName,
      quantity: Number(quantity),
    });

    setShowModal(false);
    setVariantName("");
    setQuantity("");
    setProductId("");

    fetchInventory();
  };

  /* ---------- UPDATE STOCK ---------- */
  const updateStock = async () => {
    if (!editItem) return;

    await supabase
      .from("inventory_variants")
      .update({ quantity: Number(editQty) })
      .eq("id", editItem.id);

    setEditItem(null);
    fetchInventory();
  };

  /* ---------- DELETE STOCK ---------- */
  const deleteStock = async () => {
    if (!editItem) return;

    await supabase.from("inventory_variants").delete().eq("id", editItem.id);

    setEditItem(null);
    fetchInventory();
  };

  return (
    <ScrollView style={styles.screen}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Inventory</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addText}>+ Add Item</Text>
        </Pressable>
      </View>

      {/* Inventory List */}
      <View style={styles.list}>
        {Object.keys(groupedItems).map((productName) => (
          <View key={productName} style={{ marginBottom: 20 }}>
            <Text style={styles.productTitle}>{productName}</Text>

            {groupedItems[productName].map((item: any) => (
              <View key={item.id} style={styles.card}>
                <View>
                  <Text style={styles.name}>{item.variant_name}</Text>
                  <Text style={styles.qty}>Stock: {item.quantity}</Text>
                </View>

                <Pressable
                  style={styles.updateBtn}
                  onPress={() => {
                    setEditItem(item);
                    setEditQty(String(item.quantity));
                  }}
                >
                  <Text style={styles.updateText}>Update</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* ADD ITEM MODAL */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Inventory</Text>

            <Text style={styles.label}>Select Product</Text>
            {products.map((p) => (
              <Pressable key={p.id} onPress={() => setProductId(p.id)}>
                <Text
                  style={[
                    styles.productOption,
                    productId === p.id && styles.selected,
                  ]}
                >
                  {p.name}
                </Text>
              </Pressable>
            ))}

            <TextInput
              placeholder="Variant (eg: 6mm, PAG 46)"
              value={variantName}
              onChangeText={setVariantName}
              style={styles.input}
            />

            <TextInput
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.input}
            />

            <Pressable style={styles.addBtn} onPress={saveItem}>
              <Text style={styles.addText}>Save</Text>
            </Pressable>

            <Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* UPDATE / DELETE MODAL */}
      <Modal visible={!!editItem} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Stock</Text>

            <Text style={{ marginBottom: 6 }}>
              {editItem?.inventory_products?.name} – {editItem?.variant_name}
            </Text>

            <TextInput
              value={editQty}
              onChangeText={setEditQty}
              keyboardType="numeric"
              style={styles.input}
            />

            <Pressable style={styles.addBtn} onPress={updateStock}>
              <Text style={styles.addText}>Update</Text>
            </Pressable>

            <Pressable style={{ marginTop: 10 }} onPress={deleteStock}>
              <Text style={{ color: "#ef4444", textAlign: "center" }}>
                Delete Variant
              </Text>
            </Pressable>

            <Pressable onPress={() => setEditItem(null)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
>>>>>>> 09395ca (Initial project setup)
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  topBar: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 20, fontWeight: "700" },

  addBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  addText: { color: "#fff", fontWeight: "600" },

  list: { padding: 16 },

  productTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: { fontSize: 16, fontWeight: "600" },

  qty: { fontSize: 13, color: "#64748b" },

  updateBtn: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  updateText: { color: "#2563eb", fontWeight: "600" },

  modalBg: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
  },

  modalCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  label: { marginTop: 8, fontWeight: "600" },

  productOption: { padding: 6 },

  selected: { color: "#2563eb", fontWeight: "700" },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#ef4444",
  },
>>>>>>> 09395ca (Initial project setup)
});
