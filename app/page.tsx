import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, MapPin, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Index() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mes Chantiers</h1>
          <p className="text-slate-500">Gérez vos suivis de travaux</p>
        </div>
        <Link 
          href="/new-project" 
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </header>

      {/* Si Supabase a un problème de droit ou de clé, on l'affiche en rouge tout de suite */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Erreur Supabase :</p>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {!projects || projects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
            Aucun chantier trouvé. Cliquez sur le bouton + pour en créer un.
          </div>
        ) : (
          projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/project/${project.id}`}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.99] transition-all"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900">{project.name}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {project.location || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </Link>
          ))
        )}
      </div>
    </main>
  );
}