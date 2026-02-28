// ============================
// billing.service.ts
// ============================

import { supabase } from "@/src/core/lib/supabase";
import { generateBill } from "../utils/generateBill";
import { generateBillPDF } from "../utils/pdfService";
import { CarWithCustomer } from "../types/billing.types";

export const loadBillingInitialData = async () => {
    const [services, products, problems] = await Promise.all([
        supabase
            .from("services")
            .select("id, service_name")
            .eq("is_active", true),

        supabase.from("inventory_products").select("id, name"),

        supabase.from("problem_types").select("id, name"),
    ]);

    return {
        services: services.data || [],
        products: products.data || [],
        problems: problems.data || [],
    };
};

export const fetchCarByNumber = async (carNumber: string) => {
    const number = carNumber.trim().toUpperCase();

    if (!number) return null;

    const { data, error } = await supabase
        .from("cars")
        .select(
            `
      car_model,
      customers:customer_id (
        name,
        mobile
      )
    `,
        )
        .eq("car_number", number)
        .maybeSingle<CarWithCustomer>();

    if (error) throw error;

    return data;
};

export const createFullInvoice = async ({
    vehicleForm,
    services,
    problems,
    problemsList,
    otherProblem,
    laborCharge,
    extraCharge,
    remarks,
}: any) => {
    const { customerName, mobile, carNumber, carModel } = vehicleForm;

    // 1️⃣ Save Customer
    const { data: customer } = await supabase
        .from("customers")
        .upsert(
            { name: customerName, mobile },
            { onConflict: "mobile" },
        )
        .select()
        .single();

    if (!customer) throw new Error("Customer save failed");

    // 2️⃣ Save Car
    const { data: car } = await supabase
        .from("cars")
        .upsert(
            {
                car_number: carNumber,
                car_model: carModel,
                customer_id: customer.id,
            },
            { onConflict: "car_number" },
        )
        .select()
        .single();

    if (!car) throw new Error("Car save failed");

    // 3️⃣ Prepare services payload
    const payload = Object.entries(services).map(([id, s]: any) => ({
        service_id: id,
        service_charge: s.service_charge,
        parts: s.parts,
    }));

    // 4️⃣ Create Bill
    const res: any = await generateBill({
        customer_id: customer.id,
        car_id: car.id,
        problems: problems.map((p: string) =>
            p === "other"
                ? otherProblem
                : problemsList.find((x: any) => x.id === p)?.name || "",
        ),
        services: payload,
        labor_charge: Number(laborCharge) || 0,
        extra_charge: Number(extraCharge) || 0,
        remarks,
    });

    // 5️⃣ Generate PDF
    await generateBillPDF({
        billId: res.bill_id,
        invoiceNo: res.invoice_no,
        customerName,
        mobile,
        carNumber,
        carModel,
    });

    return res;
};