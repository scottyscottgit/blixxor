import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, ArrowRight, MapPin, Calendar, HardHat, Building2, Sparkles, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: projects }, { data: company }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("company_settings")
      .select("*")
      .eq("id", "default")
      .single(),
  ]);

  const companyName = company?.company_name || "Mon Entreprise BTP";
  const hasDecennale = Boolean(company?.insurance_name && company?.insurance_policy);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* En-tête principal */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              B
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                BLIXXOR
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Suivi de chantier & Rapports
              </p>
            </div>
          </div>

          <Link
            href="/company"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-200"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Mon Entreprise</span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-5 space-y-5">
        {/* Carte Profil Entreprise / Personnalisation */}
        <Link
          href="/company"
          className="block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all group border border-slate-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0"
                style={{ borderColor: company?.primary_color || undefined }}
              >
                {company?.logo_url ? (
                  <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Building2 className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                    {companyName}
                  </h2>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                  {hasDecennale ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Décennale configurée
                    </span>
                  ) : (
                    <span className="text-amber-300">⚠️ Décennale / Logo à compléter</span>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Section Chantiers */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-base font-bold text-slate-900">Mes Chantiers</h2>
            <p className="text-xs text-slate-500">
              {projects?.length || 0} chantier{(projects?.length || 0) > 1 ? "s" : ""} enregistré{(projects?.length || 0) > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/new-project"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Chantier</span>
          </Link>
        </div>

        {/* Liste des chantiers */}
        <div className="space-y-3">
          {(!projects || projects.length === 0) ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
              <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Aucun chantier créé</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Commencez par créer votre premier chantier pour capturer photos, notes vocales et générer des rapports.
              </p>
              <Link
                href="/new-project"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Créer un chantier
              </Link>
            </div>
          ) : (
            projects.map((project: any) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.99] group"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {project.location || "Adresse non renseignée"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(project.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}