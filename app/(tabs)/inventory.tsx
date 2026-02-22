// InventoryScreen.tsx

import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ------------------------------------------------------------------ */
/* THEME */
/* ------------------------------------------------------------------ */

const COLORS = {
  primary: "#2563eb",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#ef4444",

  bg: "#f8fafc",
  card: "#ffffff",

  text: "#0f172a",
  muted: "#64748b",
  border: "#e5e7eb",
};

/* ------------------------------------------------------------------ */
/* SCREEN */
/* ------------------------------------------------------------------ */

export default function InventoryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [productId, setProductId] = useState("");
  const [variantName, setVariantName] = useState("");
  const [quantity, setQuantity] = useState("");

  const [editItem, setEditItem] = useState<any>(null);
  const [editQty, setEditQty] = useState("");

  /* ------------------------------------------------------------------ */
  /* FETCH INVENTORY */
  /* ------------------------------------------------------------------ */

  const fetchInventory = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("inventory_variants").select(
        `
          id,
          variant_name,
          quantity,
          inventory_products!inventory_variants_product_id_fkey (
            name
          )
        `,
      );

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      Alert.alert("Error", "Failed to load inventory");
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* FETCH PRODUCTS */
  /* ------------------------------------------------------------------ */

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_products")
        .select("id, name");

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Product fetch error:", error);
      Alert.alert("Error", "Failed to load products");
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* LOAD ALL DATA */
  /* ------------------------------------------------------------------ */

  const loadData = useCallback(async () => {
    setLoading(true);

    await Promise.all([fetchInventory(), fetchProducts()]);

    setLoading(false);
  }, [fetchInventory, fetchProducts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ------------------------------------------------------------------ */
  /* GROUP INVENTORY */
  /* ------------------------------------------------------------------ */

  const groupedItems = items.reduce((acc: any, item: any) => {
    const name = item.inventory_products?.name;

    if (!name) return acc;

    if (!acc[name]) acc[name] = [];

    acc[name].push(item);

    return acc;
  }, {});

  /* ------------------------------------------------------------------ */
  /* HELPERS */
  /* ------------------------------------------------------------------ */

  const getStockColor = (qty: number) => {
    if (qty < 5) return COLORS.danger;
    if (qty < 10) return COLORS.warning;

    return COLORS.success;
  };

  const isValidNumber = (val: string) => {
    return !isNaN(Number(val)) && Number(val) >= 0;
  };

  /* ------------------------------------------------------------------ */
  /* ADD ITEM */
  /* ------------------------------------------------------------------ */

  const saveItem = async () => {
    if (!productId || !variantName || !quantity) {
      Alert.alert("Missing Fields", "Fill all fields");
      return;
    }

    if (!isValidNumber(quantity)) {
      Alert.alert("Invalid Quantity", "Enter valid number");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("inventory_variants").insert({
        product_id: productId,
        variant_name: variantName.trim(),
        quantity: Number(quantity),
      });

      if (error) throw error;

      setShowModal(false);

      setProductId("");
      setVariantName("");
      setQuantity("");

      fetchInventory();
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* UPDATE */
  /* ------------------------------------------------------------------ */

  const updateStock = async () => {
    if (!editItem || !isValidNumber(editQty)) {
      Alert.alert("Invalid Input", "Enter valid quantity");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("inventory_variants")
        .update({ quantity: Number(editQty) })
        .eq("id", editItem.id);

      if (error) throw error;

      setEditItem(null);

      fetchInventory();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* DELETE */
  /* ------------------------------------------------------------------ */

  const deleteStock = () => {
    Alert.alert("Delete Variant", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);

            const { error } = await supabase
              .from("inventory_variants")
              .delete()
              .eq("id", editItem.id);

            if (error) throw error;

            setEditItem(null);

            fetchInventory();
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Delete failed");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  /* ------------------------------------------------------------------ */
  /* LOADING */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Loading inventory...</Text>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>Live stock overview</Text>
        </View>

        <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {/* LIST */}

      <View style={styles.list}>
        {Object.keys(groupedItems).length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No inventory found</Text>
            <Text style={styles.emptySub}>Start by adding products</Text>
          </View>
        )}

        {Object.keys(groupedItems).map((product) => (
          <View key={product} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle}>{product}</Text>

              <Text style={styles.productCount}>
                {groupedItems[product].length} variants
              </Text>
            </View>

            {groupedItems[product].map((item: any) => {
              const color = getStockColor(item.quantity);

              return (
                <View key={item.id} style={styles.variantRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.variantName}>{item.variant_name}</Text>

                    <View style={styles.stockRow}>
                      <View
                        style={[styles.stockDot, { backgroundColor: color }]}
                      />

                      <Text style={styles.stockText}>{item.quantity} pcs</Text>
                    </View>
                  </View>

                  <Pressable
                    style={styles.editBtn}
                    onPress={() => {
                      setEditItem(item);
                      setEditQty(String(item.quantity));
                    }}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* ADD MODAL */}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Inventory</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setProductId(p.id)}
                  style={[styles.pill, productId === p.id && styles.pillActive]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      productId === p.id && styles.pillTextActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <TextInput
              placeholder="Variant name"
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

            <Pressable
              style={styles.primaryBtn}
              onPress={saveItem}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Save</Text>
              )}
            </Pressable>

            <Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}

      <Modal visible={!!editItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Update Stock</Text>

            <Text style={styles.editLabel}>
              {editItem?.inventory_products?.name} • {editItem?.variant_name}
            </Text>

            <TextInput
              value={editQty}
              onChangeText={setEditQty}
              keyboardType="numeric"
              style={styles.input}
            />

            <Pressable
              style={styles.primaryBtn}
              onPress={updateStock}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Update</Text>
              )}
            </Pressable>

            <Pressable style={styles.deleteBtn} onPress={deleteStock}>
              <Text style={styles.deleteText}>Delete Variant</Text>
            </Pressable>

            <Pressable onPress={() => setEditItem(null)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },

  loaderText: {
    marginTop: 10,
    color: COLORS.muted,
    fontFamily: "Poppins-Regular",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
    marginTop: 2,
  },

  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  addText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },

  list: {
    marginTop: 6,
  },

  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  productTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.text,
  },

  productCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
  },

  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },

  variantName: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.text,
  },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  stockText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
  },

  editBtn: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },

  editText: {
    color: COLORS.primary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 70,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.text,
  },

  emptySub: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 12,
  },

  editLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.muted,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    fontFamily: "Poppins-Regular",
  },

  pill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 10,
  },

  pillActive: {
    backgroundColor: "#eff6ff",
    borderColor: COLORS.primary,
  },

  pillText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#334155",
  },

  pillTextActive: {
    color: COLORS.primary,
    fontFamily: "Poppins-SemiBold",
  },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },

  deleteBtn: {
    marginTop: 10,
  },

  deleteText: {
    color: COLORS.danger,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },

  cancel: {
    textAlign: "center",
    marginTop: 12,
    color: COLORS.muted,
    fontFamily: "Poppins-Regular",
  },
});
