import { supabase } from "@/lib/supabase";

type PartInput = {
    inventory_variant_id: string;
    quantity: number;
    price_per_unit: number;
};

type ServiceInput = {
    service_id: string;
    service_charge: number;
    parts: PartInput[];
};

type GenerateBillPayload = {
    customer_id: string;
    car_id: string;
    problems: string[];
    services: ServiceInput[];
    labor_charge: number;
    extra_charge: number;
    remarks: string;
};

export async function generateBill(payload: GenerateBillPayload) {
    const { data, error } = await supabase.rpc("create_full_bill", {
        p_customer_id: payload.customer_id,
        p_car_id: payload.car_id,
        p_problems: payload.problems,
        p_services: payload.services,
        p_labor_charge: payload.labor_charge,
        p_extra_charge: payload.extra_charge,
        p_remarks: payload.remarks,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
