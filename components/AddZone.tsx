"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AddZone({ projectId }: { projectId: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("zones").insert([
      { 
        name, 
        project_id: projectId
      }
    ]);

    if (error) {
      alert(error.message);
    } else {
      setName("");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la zone (ex: Cuisine, Salle de bain...)"
        className="flex-1 p-3 bg-gray-900 border border-gray-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-yellow-500 text-black px-6 rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-50"
      >
        {loading ? "..." : "+ AJOUTER"}
      </button>
    </form>
  );
}