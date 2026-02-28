export type Service = {
    id: string;
    service_name: string;
};

export type Problem = {
    id: string;
    name: string;
};

export type Product = {
    id: string;
    name: string;
};

export type Variant = {
    id: string;
    variant_name: string;
    quantity: number;
};

export type PartItem = {
    inventory_variant_id: string;
    variant_name: string;
    quantity: number;
    price_per_unit: number;
};

export type SelectedService = {
    service_charge: number;
    parts: PartItem[];
};

export type CarWithCustomer = {
    car_model: string | null;
    customers: {
        name: string;
        mobile: string;
    } | null;
};

export type BillRow = {
  created_at: string;
  total_amount: number | null;
};