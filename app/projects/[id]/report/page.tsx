import PrintButton from '@/components/PrintButton';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, MapPin, Calendar, HardHat, FileText, Sparkles, AlertTriangle, Lightbulb, ClipboardList } from 'lucide-react';

export default async function ProjectReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Récupération du chantier
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (!project) {
    notFound();
  }

  // 2. Récupération des médias du chantier
  const { data: mediaItems } = await supabase
    .from('media')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true });

  // 3. Récupération des paramètres entreprise
  const { data: company } = await supabase
    .from('company_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  // 4. Récupération de l'analyse technique IA
  const { data: analysis } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('project_id', id)
    .maybeSingle();

  const brandColor = company?.primary_color || '#2563eb';
  const companyName = company?.company_name || 'Mon Entreprise BTP';

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 pb-20 print:pb-0">
      {/* Barre d'action fixe en haut (masquée à l'impression) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 print:hidden shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/projects/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au chantier</span>
          </Link>

          <PrintButton />
        </div>
      </header>

      {/* Script d'impression côté client */}
      

      {/* Feuille A4 du Rapport */}
      <main className="max-w-4xl mx-auto my-6 print:my-0 p-8 sm:p-12 bg-white rounded-3xl print:rounded-none shadow-xl print:shadow-none border border-slate-200/80 print:border-none space-y-8">
        
        {/* EN-TÊTE DU DOCUMENT */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 pb-6" style={{ borderColor: brandColor }}>
          <div className="space-y-1.5">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="Logo" className="h-14 w-auto object-contain mb-2" />
            ) : (
              <div className="flex items-center gap-2 text-xl font-black tracking-tight" style={{ color: brandColor }}>
                <HardHat className="w-7 h-7" />
                <span>{companyName}</span>
              </div>
            )}
            <div className="text-xs text-slate-500 space-y-0.5">
              {company?.address && <p>{company.address}</p>}
              <p>
                {company?.phone && <span>Tél : {company.phone} </span>}
                {company?.email && <span>• Email : {company.email}</span>}
              </p>
              {company?.siret && <p>SIRET : {company.siret}</p>}
              {company?.insurance_name && (
                <p className="font-semibold text-slate-700">
                  Garantie Décennale / RCP : {company.insurance_name} (Police N° {company.insurance_policy || 'En cours'})
                </p>
              )}
            </div>
          </div>

          <div className="text-right sm:text-right w-full sm:w-auto bg-slate-50 print:bg-transparent p-4 rounded-2xl border border-slate-100 print:border-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document Officiel</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">RAPPORT DE VISITE TECHNIQUE</h2>
            <p className="text-xs text-slate-500 mt-1">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* FICHE CHANTIER */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
          <h3 className="text-base font-bold text-slate-900">{project.name || project.title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {project.address && (
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.address}
              </span>
            )}
            {project.location && !project.address && (
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Visite effectuée le : {new Date(project.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* SECTION NIVEAU 2 : ANALYSE TECHNIQUE IA & LOTS */}
        {analysis && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Sparkles className="w-5 h-5" style={{ color: brandColor }} />
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide">
                Pré-Étude Technique & Découpage des Travaux
              </h3>
            </div>

            {/* Résumé global */}
            {analysis.summary && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed">
                <span className="font-bold block text-xs uppercase text-slate-500 mb-1">Synthèse du projet :</span>
                {analysis.summary}
              </div>
            )}

            {/* Tableau des Lots et Tâches */}
            {analysis.lots && analysis.lots.length > 0 && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-600">
                  <ClipboardList className="w-4 h-4" /> Répartition par Corps d'État (Lots)
                </h4>
                <div className="space-y-3">
                  {analysis.lots.map((lot: any, idx: number) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                        <span>Lot {idx + 1} : {lot.name}</span>
                        <span className="text-[10px] font-normal opacity-75">{lot.tasks?.length || 0} intervention(s)</span>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Désignation des travaux</th>
                            <th className="px-4 py-2 text-right font-semibold w-28">Quantité estimée</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lot.tasks?.map((task: any, tIdx: number) => (
                            <tr key={tIdx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 text-slate-700">{task.description}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                {task.quantity} {task.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alertes & Recommandations côte à côte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {analysis.missing_info && analysis.missing_info.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <h4 className="flex items-center gap-1.5 font-bold text-xs text-amber-900 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Points à préciser / Métrés manquants
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-amber-950">
                    {analysis.missing_info.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <h4 className="flex items-center gap-1.5 font-bold text-xs text-blue-900 uppercase tracking-wide">
                    <Lightbulb className="w-4 h-4 text-blue-600" /> Préconisations techniques (DTU / Terrain)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-blue-950">
                    {analysis.recommendations.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION PHOTOS ET OBSERVATIONS */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide">
              Constats Visuels & Notes de Visite ({mediaItems?.length || 0})
            </h3>
          </div>

          {(!mediaItems || mediaItems.length === 0) ? (
            <p className="text-xs text-slate-400 italic">Aucun média enregistré sur ce chantier.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mediaItems.map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  {item.type === 'photo' && item.url && (
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                      <img src={item.url} alt="Constat chantier" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {item.type === 'audio' && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2 text-xs font-semibold text-blue-800">
                      <span>🎤 Note Vocale de Visite</span>
                    </div>
                  )}

                  {item.comment && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {item.comment}
                    </p>
                  )}

                  <span className="text-[10px] text-slate-400 block text-right">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')} {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIED DE PAGE DU RAPPORT */}
        <div className="pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
          <p>Document généré par {companyName} via Blixxor — Application de suivi et pré-chiffrage technique.</p>
          <p>Ce compte-rendu constitue un diagnostic préliminaire de visite avant validation du devis définitif.</p>
        </div>
      </main>
    </div>
  );
}