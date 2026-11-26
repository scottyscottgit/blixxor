import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ReportActions from "./ReportActions";
import { Calendar, MapPin, CheckCircle2, MessageSquare, Camera, Mic } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: media } = await supabase
    .from("media")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  const getPublicUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("project-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const photoCount = media?.filter((m) => m.type === "photo").length || 0;
  const audioCount = media?.filter((m) => m.type === "audio").length || 0;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900">
      {/* Barre d'action invisible à l'impression */}
      <ReportActions projectId={id} projectName={project.name} />

      {/* Conteneur Feuille A4 */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 print:shadow-none print:border-none p-6 sm:p-10">
          
          {/* En-tête officiel du rapport */}
          <header className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 inline-block"></span>
                <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
                  BLIXXOR • RAPPORT DE VISITE
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{project.location || "Localisation non renseignée"}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Date d'édition
              </span>
              <span className="text-sm font-bold text-slate-800 capitalize">
                {currentDate}
              </span>
            </div>
          </header>

          {/* Synthèse rapide */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Photos</p>
                <p className="text-lg font-bold text-slate-900">{photoCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Notes vocales</p>
                <p className="text-lg font-bold text-slate-900">{audioCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Statut</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-700">En cours</p>
              </div>
            </div>
          </div>

          {/* Liste chronologique des observations */}
          <section className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Relevé des observations terrain
            </h2>

            {!media || media.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center italic">
                Aucune observation enregistrée sur ce chantier.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {media.map((item, index) => {
                  const isAudio = item.type === "audio";
                  const itemDate = new Date(item.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white break-inside-avoid shadow-xs flex flex-col"
                    >
                      {/* Image ou Carte Audio */}
                      {isAudio ? (
                        <div className="p-4 bg-amber-50/70 border-b border-amber-100 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Mic className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-900 block">
                              Note vocale #{index + 1}
                            </span>
                            <span className="text-[11px] text-amber-700">
                              Transcrit par IA Blixxor
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-slate-100 border-b border-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getPublicUrl(item.url)}
                            alt="Constat chantier"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Texte et horodatage */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Observation
                          </span>
                          <p className="text-sm text-slate-800 font-medium leading-relaxed">
                            {item.comment ? (
                              item.comment
                            ) : (
                              <span className="text-slate-400 italic">
                                Constat photographique sans observation écrite.
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Relevé le {itemDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pied de page du rapport */}
          <footer className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <p>Document généré automatiquement via l'application Blixxor.</p>
            <p className="font-semibold text-slate-500">Page 1 / 1 • Blixxor BTP SaaS</p>
          </footer>
        </div>
      </div>
    </div>
  );
}