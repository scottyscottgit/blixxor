"use server";

import { createClient } from "@/utils/supabase/server";

export async function saveMediaWithAutoTranscription(
  projectId: string,
  mode: string,
  filePath: string
) {
  try {
    const supabase = await createClient();
    let transcription: string | null = null;

    // Si c'est un audio, on lance la transcription automatique par IA
    if (mode === "audio") {
      const apiKey = process.env.GROQ_API_KEY;
      if (apiKey) {
        try {
          const { data: fileBlob, error: downloadErr } = await supabase.storage
            .from("project-media")
            .download(filePath);

          if (!downloadErr && fileBlob) {
            const ext = filePath.split(".").pop() || "webm";
            const formData = new FormData();
            formData.append("file", fileBlob, `audio.${ext}`);
            formData.append("model", "whisper-large-v3-turbo");
            formData.append("language", "fr");
            formData.append("prompt", "Rapport de chantier, travaux BTP, gros-oeuvre, finitions, électricité, plomberie, réserves.");

            const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
              method: "POST",
              headers: { Authorization: `Bearer ${apiKey}` },
              body: formData,
            });

            if (groqRes.ok) {
              const data = await groqRes.json();
              transcription = data.text?.trim() || null;
            }
          }
        } catch (aiErr) {
          console.error("Erreur lors de la transcription IA:", aiErr);
        }
      }
    }

    // Sauvegarde en base de données avec le commentaire IA
    const { error: dbError } = await supabase.from("media").insert({
      project_id: projectId,
      type: mode,
      url: filePath,
      comment: transcription,
    });

    if (dbError) throw new Error(dbError.message);

    return { success: true, transcription };
  } catch (error: any) {
    console.error("Erreur saveMediaWithAutoTranscription:", error);
    return { success: false, error: error?.message || "Erreur lors de l'enregistrement" };
  }
}