import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Mic, FileText, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Récupérer le projet
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single();
  if (!project) notFound();

  // 2. Récupérer les médias liés au projet
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  // URL de base pour ton storage (remplace par ton URL Supabase si besoin, 
  // mais cette méthode auto-générée est plus sûre)
  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('project-media').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 pb-24">
      <Link href="/" className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-slate-500">{project.location || 'Lieu non défini'}</p>
      </div>

      {/* BOUTONS D'ACTION RAPIDE */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link href={`/capture?projectId=${id}&mode=photo`} className="bg-blue-600 p-6 rounded-2xl text-white flex flex-col items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          <Camera className="w-8 h-8" />
          <span className="font-bold">PHOTO</span>
        </Link>
        <Link href={`/capture?projectId=${id}&mode=audio`} className="bg-emerald-600 p-6 rounded-2xl text-white flex flex-col items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-transform">
          <Mic className="w-8 h-8" />
          <span className="font-bold">AUDIO</span>
        </Link>
      </div>

      {/* LISTE DES MÉDIAS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Médias du chantier</h2>
          <span className="text-sm text-slate-400">{media?.length || 0} éléments</span>
        </div>

        {!media || media.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">Aucun média pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {media.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                {item.type === 'photo' ? (
                  <img 
                    src={getPublicUrl(item.url)} 
                    alt="Chantier" 
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 p-4">
                    <div className="bg-emerald-600 text-white p-3 rounded-full mb-2">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Note Audio</span>
                    <audio src={getPublicUrl(item.url)} className="hidden" />
                  </div>
                )}
                
                {/* Date overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-[10px] text-white font-medium">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}