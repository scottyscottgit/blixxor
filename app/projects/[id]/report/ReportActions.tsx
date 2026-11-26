"use client";

import { Printer, Share2 } from "lucide-react";

export default function ReportActions({
  projectName,
}: {
  projectName: string;
}) {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Rapport de chantier - ${projectName}`,
          text: `Voici le compte-rendu de visite pour le chantier : ${projectName}`,
          url: window.location.href,
        });
      } catch (err) {
        // Annulé
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert("Lien copié !");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-slate-200"
        title="Partager"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Partager</span>
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        <span>Télécharger le PDF</span>
      </button>
    </div>
  );
}