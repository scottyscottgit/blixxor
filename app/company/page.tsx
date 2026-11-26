import { createClient } from "@/utils/supabase/server";
import CompanyForm from "./CompanyForm";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  return <CompanyForm initial={data ?? {}} />;
}