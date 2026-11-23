"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Trash({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (e: React.MouseEvent) => {
    // 1. Empeche d'ouvrir le lien du chantier (Parent Link)
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = window.confirm("Supprimer ce chantier ?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        alert("Erreur : " + error.message);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="relative z-50 text-xs hover:scale-125 transition-transform p-2 bg-gray-800 hover:bg-red-900/50 rounded-lg disabled:opacity-50"
      title="Supprimer"
    >
      {loading ? "..." : "🗑️"}
    </button>
  );
}