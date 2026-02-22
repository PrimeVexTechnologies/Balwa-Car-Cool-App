import { supabase } from "@/lib/supabase";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";

/* ============================================================
   TYPES
============================================================ */

type GeneratePDFParams = {
  billId: string;
  invoiceNo: string;
  customerName: string;
  mobile: string;
  carNumber: string;
  carModel: string;
};

/* ============================================================
   MAIN PDF GENERATION FUNCTION
============================================================ */

export async function generateBillPDF({
  billId,
  invoiceNo,
  customerName,
  mobile,
  carNumber,
  carModel,
}: GeneratePDFParams) {
  /* --------------------------
     Fetch Bill Core Data
  -------------------------- */

  const { data: billData, error: billError } = await supabase
    .from("bills")
    .select("labor_charge, extra_charge, remarks, total_amount")
    .eq("id", billId)
    .single();

  if (billError) throw billError;

  /* --------------------------
     Fetch Problems
  -------------------------- */

  const { data: problemsData } = await supabase
    .from("problems")
    .select("problem_name")
    .eq("bill_id", billId);

  /* --------------------------
     Fetch Services + Parts
  -------------------------- */

  const { data: servicesData, error: servicesError } = await supabase
    .from("bill_services")
    .select(`
      id,
      service_total,
      services(service_name),
      bill_service_parts(
        quantity,
        price_per_unit,
        inventory_variants(variant_name)
      )
    `)
    .eq("bill_id", billId);

  if (servicesError) throw servicesError;

  /* --------------------------
     Build HTML
  -------------------------- */

  const html = buildHTML({
    invoiceNo,
    billData,
    customerName,
    mobile,
    carNumber,
    carModel,
    problemsData: problemsData || [],
    servicesData: servicesData || [],
  });

  const { uri } = await Print.printToFileAsync({ html });

  /* --------------------------
     Upload to Supabase Storage
  -------------------------- */

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  const uploadUrl = `${supabaseUrl}/storage/v1/object/invoices/${invoiceNo}.pdf`;

  const upload = await FileSystem.uploadAsync(uploadUrl, uri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      "Content-Type": "application/pdf",
    },
  });

  if (upload.status !== 200) {
    throw new Error("Upload failed");
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/invoices/${invoiceNo}.pdf`;

  await supabase.from("bill_files").insert({
    bill_id: billId,
    pdf_url: publicUrl,
  });
}

/* ============================================================
   PRIVATE HTML BUILDER
============================================================ */

function buildHTML({
  invoiceNo,
  billData,
  customerName,
  mobile,
  carNumber,
  carModel,
  problemsData,
  servicesData,
}: any) {
  return `
  <html>
    <body style="font-family: Arial; padding: 24px">

      <h2>Invoice ${invoiceNo}</h2>

      <p><b>${customerName}</b> (${mobile})</p>
      <p>${carNumber} • ${carModel}</p>

      <hr/>

      <b>Problems:</b><br/>
      ${problemsData.length
      ? problemsData
        .map((p: any) => `- ${p.problem_name}`)
        .join("<br/>")
      : "-"
    }

      <br/><br/>

      <table width="100%" border="1" cellspacing="0" cellpadding="8">
        <tr>
          <th align="left">Service</th>
          <th align="right">Amount</th>
        </tr>

        ${servicesData
      .map(
        (service: any) => `
          <tr>
            <td>
              <b>${service.services?.service_name || ""}</b><br/>
              ${service.bill_service_parts?.length
            ? service.bill_service_parts
              .map(
                (part: any) =>
                  `- ${part.inventory_variants?.variant_name}
                           (Qty ${part.quantity} × ₹${part.price_per_unit})`
              )
              .join("<br/>")
            : ""
          }
            </td>
            <td align="right">₹${service.service_total}</td>
          </tr>
        `
      )
      .join("")}
      </table>

      <br/>

      <b>Labor:</b> ₹${billData?.labor_charge || 0}<br/>
      <b>Extra:</b> ₹${billData?.extra_charge || 0}<br/>
      <b>Remarks:</b> ${billData?.remarks || "-"}<br/>

      <h3 style="text-align:right; margin-top:20px;">
        Total ₹${billData?.total_amount || 0}
      </h3>

    </body>
  </html>
  `;
}
