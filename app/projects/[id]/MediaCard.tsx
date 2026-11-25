"use client";

import { useState, useTransition, useEffect } from "react";
import { Trash2, Mic, MessageSquarePlus, Check, Loader2, Calendar, X, ZoomIn } from "lucide-react";
import { deleteMediaAction, updateMediaCommentAction } from "./actions";

export interface MediaItem {
  id: string;
  project_id: string;
  url: string;
  raw_path?: string;
  type?: string;
  comment?: string | null;
  created_at: string;
}

export default function MediaCard({ media }: { media: MediaItem }) {
  const [isPending, startTransition] = useTransition();
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentText, setCommentText] = useState(media.comment || "");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const isAudio =
    media.type === "audio" ||
    /\.(webm|mp3|wav|m4a|ogg|aac|mp4)$/i.test(media.url);

  const formattedDate = new Date(media.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fermer le plein écran avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsViewerOpen(false);
    };
    if (isViewerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Empêche de scroller derrière
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isViewerOpen]);

  const handleDelete = () => {
    if (!window.confirm("Supprimer définitivement cet élément ?")) return;

    startTransition(async () => {
      const res = await deleteMediaAction(
        media.id,
        media.raw_path || media.url,
        media.project_id
      );
      if (!res.success) alert(res.error);
    });
  };

  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingComment(true);
    const res = await updateMediaCommentAction(
      media.id,
      commentText,
      media.project_id
    );
    setIsSavingComment(false);

    if (res.success) {
      setIsEditingComment(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between transition-all ${
          isPending ? "opacity-40 pointer-events-none scale-95" : ""
        }`}
      >
        <div>
          {/* Entête avec Date et Poubelle */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>

            <button
              onClick={handleDelete}
              disabled={isPending}
              title="Supprimer"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Média : Note vocale OU Photo cliquable */}
          {isAudio ? (
            <div className="p-4 bg-amber-50/60 flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Note vocale</p>
                  <p className="text-xs text-slate-500">Audio chantier</p>
                </div>
              </div>

              <audio
                controls
                preload="metadata"
                src={media.url}
                className="w-full h-10 mt-1"
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          ) : (
            <div
              onClick={() => setIsViewerOpen(true)}
              className="relative aspect-video bg-slate-100 group cursor-pointer overflow-hidden"
              title="Cliquer pour agrandir la photo"
            >
              <img
                src={media.url}
                alt={media.comment || "Photo du chantier"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-black/60 text-white p-2 rounded-full backdrop-blur-sm shadow-md">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zone Commentaire / Note */}
        <div className="p-3 bg-white border-t border-slate-100">
          {isEditingComment ? (
            <form onSubmit={handleSaveComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ajouter une observation..."
                autoFocus
                className="flex-1 text-sm px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
              <button
                type="submit"
                disabled={isSavingComment}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isSavingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingComment(true)}
              className="w-full text-left flex items-start gap-2 group cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-colors" />
              {media.comment ? (
                <p className="text-sm text-slate-700 group-hover:text-slate-900 break-words leading-tight">
                  {media.comment}
                </p>
              ) : (
                <span className="text-xs text-slate-400 group-hover:text-blue-600 italic transition-colors">
                  Ajouter une note / observation...
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MODAL / VISIONNEUSE PLEIN ÉCRAN */}
      {isViewerOpen && (
        <div
          onClick={() => setIsViewerOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6"
        >
          {/* Barre du haut avec date et bouton fermer */}
          <div className="flex items-center justify-between text-white/80 max-w-5xl w-full mx-auto">
            <span className="text-sm font-medium">{formattedDate}</span>
            <button
              onClick={() => setIsViewerOpen(false)}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Fermer (ou touche Échap)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image agrandie au centre */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center my-4 overflow-hidden"
          >
            <img
              src={media.url}
              alt={media.comment || "Photo plein écran"}
              className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
            />
          </div>

          {/* Observation en bas */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full mx-auto text-center"
          >
            {media.comment ? (
              <p className="bg-slate-900/80 text-white text-sm px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-md inline-block">
                {media.comment}
              </p>
            ) : (
              <p className="text-xs text-white/50 italic">
                Cliquer n'importe où pour fermer
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}