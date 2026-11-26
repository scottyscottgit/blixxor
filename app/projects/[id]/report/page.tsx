import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import ReportActions from "./ReportActions";

export const dynamic = "force-dynamic";

export default async function ProjectReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project, error: projectError }, { data: media }, { data: company }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    supabase.from("project_media").select("*").eq("project_id", id).order("created_at", { ascending: true }),
    supabase.from("company_settings").select("*").eq("id", "default").single(),
  ]);

  if (projectError || !project) {
    notFound();
  }

  const photos = media?.filter((m) => m.media_type === "photo") || [];
  const audios = media?.filter((m) => m.media_type === "audio") || [];

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const brandColor = company?.primary_color || "#2563eb";
  const companyName = company?.company_name || "Mon Entreprise BTP";
  const showBadge = company?.show_blixxor_badge ?? true;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 print:hidden shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href={`/projects/${id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au chantier</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/company"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Modifier en-tête</span>
            </Link>
            <ReportActions projectName={project.name} />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto my-6 p-8 bg-white rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none">
        
        <div 
          className="h-2.5 w-full rounded-t-lg -mt-8 -mx-8 mb-6 print:m-0 print:mb-6"
          style={{ backgroundColor: brandColor }}
        />

        <header className="border-b border-slate-200 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              {company?.logo_url ? (
                <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={company.logo_url} alt={companyName} className="w-full h-full object-contain" loading="eager" />
                </div>
              ) : (
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  {companyName.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{companyName}</h1>
                {company?.contact_name && (
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">Contact : {company.contact_name}</p>
                )}
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  {company?.address && <p>{company.address} {company.postal_code} {company.city}</p>}
                  <p>
                    {company?.phone && <span>Tél : {company.phone}</span>}
                    {company?.phone && company?.email && <span> • </span>}
                    {company?.email && <span>{company.email}</span>}
                  </p>
                  {company?.siret && (
                    <p className="font-mono text-[11px] text-slate-400">
                      SIRET : {company.siret} {company.vat_number ? `• TVA : ${company.vat_number}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end">
              <span 
                className="inline-block px-3 py-1 text-xs font-black uppercase tracking-wider text-white rounded-lg shadow-sm mb-1.5"
                style={{ backgroundColor: brandColor }}
              >
                Rapport de Visite
              </span>
              <p className="text-xs font-medium text-slate-500">Date d'émission : {today}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Chantier : {project.name}</p>
            </div>
          </div>

          {(company?.insurance_name || company?.insurance_policy) && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Garantie Décennale / RCP :</strong> {company.insurance_name || "Assurance BTP"}
                {company.insurance_policy ? ` (Police n° ${company.insurance_policy})` : ""}
                {company.insurance_coverage ? ` - Zone : ${company.insurance_coverage}` : ""}
              </span>
            </div>
          )}
        </header>

        <section className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:bg-transparent print:border-slate-300">
          <div>
            <span className="text-slate-500 font-medium block">Nom du chantier :</span>
            <span className="font-bold text-slate-800 text-sm">{project.name}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Localisation :</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {project.location || "Non précisée"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Date de création :</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(project.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">État du chantier :</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200">
              En cours
            </span>
          </div>
        </section>

        {audios.length > 0 && (
          <section className="mb-6">
            <h2 
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b"
              style={{ color: brandColor, borderColor: `${brandColor}40` }}
            >
              Notes et Dictées Vocales ({audios.length})
            </h2>
            <div className="space-y-2.5">
              {audios.map((audio: any, idx: number) => (
                <div key={audio.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs break-inside-avoid print:bg-transparent">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600">Note vocale #{idx + 1}</span>
                    <span>{new Date(audio.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  {audio.transcription ? (
                    <p className="text-slate-800 leading-relaxed italic font-serif">« {audio.transcription} »</p>
                  ) : (
                    <p className="text-slate-400 italic">Enregistrement audio sans transcription.</p>
                  )}
                  {audio.caption && (
                    <p className="text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200 font-medium">Observation : {audio.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 
            className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b"
            style={{ color: brandColor, borderColor: `${brandColor}40` }}
          >
            Photos & Constats de Chantier ({photos.length})
          </h2>

          {photos.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">Aucune photo enregistrée sur ce chantier.</p>
          ) : (
            /* Force l'affichage en une seule colonne à l'impression pour éviter les bugs mobiles */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:block print:space-y-6">
              {photos.map((photo: any, index: number) => (
                <div
                  key={photo.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-2.5 break-inside-avoid shadow-sm print:bg-transparent print:border-slate-300"
                >
                  {/* Suppression de aspect-video à l'impression et object-contain pour ne pas couper l'image */}
                  <div className="w-full h-56 rounded-lg overflow-hidden bg-slate-200 mb-2 relative print:h-auto print:bg-transparent">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.file_url}
                      alt={photo.caption || `Constat #${index + 1}`}
                      className="w-full h-full object-cover print:object-contain print:max-h-80 print:h-auto print:mx-auto"
                      loading="eager"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-700">Photo #{index + 1}</span>
                      <span>{new Date(photo.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {photo.caption ? (
                      <p className="text-xs text-slate-800 font-medium leading-snug">{photo.caption}</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Sans commentaire particulier.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 pt-4 border-t border-slate-200 text-xs text-slate-400 space-y-2">
          {company?.footer_notes && (
            <p className="text-center text-slate-600 font-medium italic text-[11px]">{company.footer_notes}</p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <p>Rapport généré le {today} pour le compte du client.</p>
            {showBadge && (
              <p className="flex items-center gap-1 font-semibold text-slate-600">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Propulsé par <span className="text-blue-600 font-bold">Blixxor</span>
              </p>
            )}
          </div>
        </footer>

      </main>
    </div>
  );
}