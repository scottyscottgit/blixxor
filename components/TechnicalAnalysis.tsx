'use client';

import { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, Loader2, RefreshCw, ClipboardList } from 'lucide-react';

type Task = { description: string; quantity: string; unit: string };
type Lot = { name: string; tasks: Task[] };
type Analysis = {
  summary: string;
  lots: Lot[];
  missing_info: string[];
  recommendations: string[];
  updated_at: string;
};

export default function TechnicalAnalysis({ projectId }: { projectId: string }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/analyze?projectId=${projectId}`)
      .then((r) => r.json())
      .then((d) => setAnalysis(d?.analysis || null))
      .catch(() => setError("Impossible de charger l’analyse"))
      .finally(() => setLoading(false));
  }, [projectId]);

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur IA');
      setAnalysis(data.analysis);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="bg-white rounded-2xl border p-5 text-sm text-slate-500">Chargement de l’analyse...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <Sparkles className="w-5 h-5 text-violet-600" /> Analyse Technique IA
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Lots, métrés et informations manquantes, générés depuis vos notes de visite.</p>
        </div>
        {analysis && (
          <button onClick={generate} disabled={generating} className="shrink-0 flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} /> Regénérer
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

      {!analysis ? (
        <button onClick={generate} disabled={generating} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 rounded-xl disabled:opacity-60 shadow-sm transition-colors">
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {generating ? 'Analyse en cours par l’IA...' : 'Générer l’analyse technique'}
        </button>
      ) : (
        <>
          {analysis.summary && <p className="bg-violet-50/70 border border-violet-100 text-slate-800 text-sm leading-relaxed p-4 rounded-xl">{analysis.summary}</p>}

          {analysis.missing_info?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <h3 className="flex items-center gap-2 font-bold text-amber-800 text-sm"><AlertTriangle className="w-4 h-4" /> Informations manquantes pour chiffrer</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-amber-900">
                {analysis.missing_info.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          {analysis.lots?.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm"><ClipboardList className="w-4 h-4" /> Découpage par lots</h3>
              {analysis.lots.map((lot, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">{lot.name}</div>
                  <ul className="divide-y divide-slate-100">
                    {lot.tasks?.map((task, j) => (
                      <li key={j} className="flex justify-between items-center gap-3 px-4 py-2.5 text-sm">
                        <span className="text-slate-700">{task.description}</span>
                        <span className="shrink-0 font-semibold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded-md">{task.quantity} {task.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {analysis.recommendations?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <h3 className="flex items-center gap-2 font-bold text-blue-800 text-sm"><Lightbulb className="w-4 h-4" /> Recommandations techniques</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-blue-900">
                {analysis.recommendations.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-400">Dernière analyse : {new Date(analysis.updated_at).toLocaleString('fr-FR')}</p>
        </>
      )}
    </div>
  );
}