'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase
      .from('projects')
      .insert([{ 
        name: formData.get('name'), 
        location: formData.get('location') 
      }]);

    if (error) {
      alert("Erreur Supabase : " + error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-slate-500 mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Nouveau chantier</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nom du projet</label>
            <input
              required
              name="name"
              type="text"
              placeholder="ex: Villa Vlad"
              className="w-full p-4 rounded-2xl bg-slate-100 border-none text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Lieu / Ville</label>
            <input
              name="location"
              type="text"
              placeholder="ex: Transylvanie"
              className="w-full p-4 rounded-2xl bg-slate-100 border-none text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            CRÉER LE CHANTIER
          </button>
        </form>
      </div>
    </main>
  );
}