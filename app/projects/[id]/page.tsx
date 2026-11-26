import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Mic, FileText, FileDown } from "lucide-react";
import MediaCard from "./MediaCard";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
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
    .order("created_at", { ascending: false });

  const getPublicUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("project-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const mediaItems = (media || []).map((item) => ({
    ...item,
    raw_path: item.url,
    url: getPublicUrl(item.url),
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux chantiers
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{project.location || "Lieu non défini"}</p>
      </div>

      {/* BOUTONS D'ACTION RAPIDE */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <Link
          href={`/capture?projectId=${id}&mode=photo`}
          className="bg-blue-600 active:bg-blue-700 p-5 rounded-2xl text-white flex flex-col items-center justify-center gap-2 shadow-md shadow-blue-200 active:scale-95 transition-all"
        >
          <Camera className="w-7 h-7" />
          <span className="font-bold text-sm tracking-wide">PHOTO</span>
        </Link>
        <Link
          href={`/capture?projectId=${id}&mode=audio`}
          className="bg-emerald-600 active:bg-emerald-700 p-5 rounded-2xl text-white flex flex-col items-center justify-center gap-2 shadow-md shadow-emerald-200 active:scale-95 transition-all"
        >
          <Mic className="w-7 h-7" />
          <span className="font-bold text-sm tracking-wide">AUDIO</span>
        </Link>
      </div>

      {/* BOUTON MAGIQUE RAPPORT PDF */}
      <Link
        href={`/projects/${id}/report`}
        className="w-full mb-8 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-slate-300 transition-all cursor-pointer"
      >
        <FileDown className="w-4 h-4 text-blue-400" />
        <span>GÉNÉRER LE RAPPORT DE VISITE PDF</span>
      </Link>

      {/* LISTE DES MÉDIAS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Médias & Observations</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full">
            {mediaItems.length} élément{mediaItems.length > 1 ? "s" : ""}
          </span>
        </div>

        {mediaItems.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Aucun média pour le moment.</p>
            <p className="text-slate-400 text-xs mt-1">
              Utilisez les boutons ci-dessus pour ajouter des photos ou notes vocales.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaItems.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}