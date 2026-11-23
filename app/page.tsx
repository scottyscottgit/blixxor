import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, MapPin, Calendar, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Index() {
  const supabase = await createClient();
  
  // Récupérer la liste des projets depuis Supabase
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
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </header>

      <div className="grid gap-4">
        {!projects || projects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <p className="text-slate-400">Aucun chantier trouvé. Créez-en un nouveau !</p>
          </div>
        ) : (
          projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/project/${project.id}`}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {project.location || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))
        )}
      </div>
    </main>
  );
}