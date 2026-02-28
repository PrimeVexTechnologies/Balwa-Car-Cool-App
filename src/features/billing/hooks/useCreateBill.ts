// ============================
// useCreateBill.ts
// ============================

import { useState, useMemo } from "react";
import { SelectedService } from "../types/billing.types";

export default function useCreateBill() {
    /* Step */
    const [step, setStep] = useState(1);

    /* Vehicle */
    const [vehicleForm, setVehicleForm] = useState({
        carNumber: "",
        customerName: "",
        mobile: "",
        carModel: "",
    });

    const [step1Error, setStep1Error] = useState("");

    /* Problems */
    const [problems, setProblems] = useState<string[]>([]);
    const [otherProblem, setOtherProblem] = useState("");

    /* Services */
    const [services, setServices] = useState<
        Record<string, SelectedService>
    >({});

    /* Charges */
    const [laborCharge, setLaborCharge] = useState("");
    const [extraCharge, setExtraCharge] = useState("");
    const [remarks, setRemarks] = useState("");

    /* Preview Total */
    const previewTotal = useMemo(() => {
        return (
            Object.values(services).reduce((sum, s) => {
                const parts = s.parts.reduce(
                    (p, x) => p + x.quantity * x.price_per_unit,
                    0,
                );

                return sum + parts + s.service_charge;
            }, 0) +
            Number(laborCharge || 0) +
            Number(extraCharge || 0)
        );
    }, [services, laborCharge, extraCharge]);

    /* Validation */
    const validateStep1 = () => {
        if (!vehicleForm.carNumber.trim()) {
            setStep1Error("Car number is required");
            return false;
        }

        if (!vehicleForm.customerName.trim()) {
            setStep1Error("Customer name is required");
            return false;
        }

        if (!/^\d{10}$/.test(vehicleForm.mobile)) {
            setStep1Error("Enter valid 10-digit mobile number");
            return false;
        }

        if (!vehicleForm.carModel.trim()) {
            setStep1Error("Car model is required");
            return false;
        }

        setStep1Error("");
        return true;
    };

    const resetAll = () => {
        setStep(1);
        setVehicleForm({
            carNumber: "",
            customerName: "",
            mobile: "",
            carModel: "",
        });
        setProblems([]);
        setOtherProblem("");
        setServices({});
        setLaborCharge("");
        setExtraCharge("");
        setRemarks("");
    };

    return {
        step,
        setStep,
        vehicleForm,
        setVehicleForm,
        step1Error,
        validateStep1,
        problems,
        setProblems,
        otherProblem,
        setOtherProblem,
        services,
        setServices,
        laborCharge,
        setLaborCharge,
        extraCharge,
        setExtraCharge,
        remarks,
        setRemarks,
        previewTotal,
        resetAll,
    };
}