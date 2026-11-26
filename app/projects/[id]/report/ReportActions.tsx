"use client";

import { Printer, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReportActions({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rapport de chantier - ${projectName}`,
          text: `Voici le compte-rendu de visite pour le chantier : ${projectName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Partage annulé");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Lien du rapport copié dans le presse-papier !");
    }
  };

  return (
    <div className="no-print bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 p-4 border-b border-slate-800 text-white flex items-center justify-between">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="flex items-center gap-2.5">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-slate-700"
          title="Partager par WhatsApp, SMS ou Mail"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Partager</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Télécharger le PDF</span>
        </button>
      </div>
    </div>
  );
}