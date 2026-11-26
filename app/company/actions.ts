"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const TEXT_FIELDS = [
  "company_name", "contact_name", "email", "phone", "address", "postal_code",
  "city", "siret", "vat_number", "insurance_name", "insurance_policy",
  "insurance_coverage", "footer_notes",
];

export async function saveCompanySettings(formData: FormData) {
  try {
    const supabase = await createClient();

    const row: Record<string, any> = {
      id: "default",
      updated_at: new Date().toISOString(),
    };
    for (const f of TEXT_FIELDS) row[f] = String(formData.get(f) ?? "").trim();
    if (!row.company_name) row.company_name = "Mon Entreprise BTP";
    if (!row.insurance_coverage) row.insurance_coverage = "France métropolitaine";
    row.primary_color = String(formData.get("primary_color") || "#2563eb");
    row.show_blixxor_badge = formData.get("show_blixxor_badge") === "true";

    let logo_url = String(formData.get("existing_logo_url") ?? "");

    const file = formData.get("logo_file");
    if (file instanceof File && file.size > 0) {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `company/logo_${Date.now()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, buffer, { contentType: file.type || "image/png", upsert: true });

      if (uploadError) {
        return { success: false, error: "Upload du logo impossible : " + uploadError.message };
      }
      logo_url = supabase.storage.from("project-media").getPublicUrl(path).data.publicUrl;
    }
    row.logo_url = logo_url;

    const { error } = await supabase.from("company_settings").upsert(row);
    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/company");
    revalidatePath("/projects", "layout");
    return { success: true, logo_url };
  } catch (err: any) {
    return { success: false, error: err?.message || "Une erreur est survenue" };
  }
}