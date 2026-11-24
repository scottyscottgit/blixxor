import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewProject() {
  async function createProject(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const location = formData.get('location') as string;

    const supabase = await createClient();
    const { error } = await supabase.from('projects').insert([{ name, location }]);

    if (error) {
      redirect(`/new-project?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Nouveau chantier</h1>

        <form action={createProject} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom du projet</label>
            <input
              required
              name="name"
              type="text"
              placeholder="ex: Villa Vlad"
              className="w-full p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lieu / Ville</label>
            <input
              name="location"
              type="text"
              placeholder="ex: Transylvanie"
              className="w-full p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition-all active:scale-95"
          >
            CRÉER LE CHANTIER
          </button>
        </form>
      </div>
    </main>
  );
}