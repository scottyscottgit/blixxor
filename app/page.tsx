import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Mes Chantiers</h1>
          <Link
            href="/new" // ou la page de création
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Nouveau
          </Link>
        </header>

        <div className="grid gap-4">
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group"
            >
              <div>
                <h2 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h2>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{project.address || 'Adresse non renseignée'}</span>
                </div>
              </div>
              <div className="text-blue-600 font-medium text-sm">OUVRIR →</div>
            </Link>
          ))}

          {(!projects || projects.length === 0) && (
            <div className="text-center py-12 text-slate-400">
              Aucun chantier. Créez-en un !
            </div>
          )}
        </div>
      </div>
    </main>
  );
}