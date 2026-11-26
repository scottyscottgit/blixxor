import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    const { data: mediaItems } = await supabase
      .from('media')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    const rawObservations = mediaItems
      ?.filter((m: any) => m.comment && m.comment.trim().length > 0)
      .map((m: any, idx: number) => `Observation ${idx + 1} (${m.type}): ${m.comment.trim()}`)
      .join('\n\n') || 'Aucune observation détaillée enregistrée.';

    const contextText = `
CHANTIER : ${project.title}
DESCRIPTION : ${project.description || 'Non renseignée'}
LOCALISATION : ${project.location || 'Non renseignée'}

OBSERVATIONS TERRAIN :
${rawObservations}
    `.trim();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé GROQ_API_KEY manquante dans .env.local' }, { status: 500 });
    }

    const prompt = `Tu es un Métreur BTP. Analyse ces observations de chantier et réponds au format JSON strict.

Données du chantier :
${contextText}

Structure JSON attendue :
{
  "summary": "synthèse des travaux",
  "lots": [
    {
      "name": "Nom du lot",
      "tasks": [
        { "description": "Tâche à réaliser", "quantity": "Quantité estimée ou À mesurer", "unit": "m²/ml/u/forfait" }
      ]
    }
  ],
  "missing_info": ["cote ou détail manquant 1", "détail manquant 2"],
  "recommendations": ["conseil technique ou sécurité 1", "conseil 2"]
}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!groqResponse.ok) {
      const errorDetail = await groqResponse.text();
      console.error('Détail Erreur Groq:', errorDetail);
      return NextResponse.json({ error: `Groq: ${errorDetail}` }, { status: 502 });
    }

    const groqData = await groqResponse.json();
    const parsedAnalysis = JSON.parse(groqData.choices[0].message.content);

    const { data: savedAnalysis, error: saveErr } = await supabase
      .from('project_analyses')
      .upsert({
        project_id: projectId,
        summary: parsedAnalysis.summary,
        lots: parsedAnalysis.lots,
        missing_info: parsedAnalysis.missing_info,
        recommendations: parsedAnalysis.recommendations,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id' })
      .select()
      .single();

    if (saveErr) {
      return NextResponse.json({ error: `Supabase: ${saveErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysis: savedAnalysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('project_analyses')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ analysis: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}