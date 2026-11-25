"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function deleteMediaAction(
  mediaId: string,
  storagePathOrUrl: string,
  projectId: string
) {
  try {
    const supabase = await createClient();

    let filePath = storagePathOrUrl;
    if (filePath.includes("/project-media/")) {
      filePath = filePath.split("/project-media/")[1];
    }
    filePath = decodeURIComponent(filePath);

    const { error: storageErr } = await supabase.storage
      .from("project-media")
      .remove([filePath]);

    if (storageErr) {
      console.error("Erreur Storage:", storageErr.message);
    }

    const { error: dbErr } = await supabase
      .from("media")
      .delete()
      .eq("id", mediaId);

    if (dbErr) throw new Error(dbErr.message);

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Erreur deleteMediaAction:", error);
    return { success: false, error: error?.message || "Impossible de supprimer ce média." };
  }
}

export async function updateMediaCommentAction(
  mediaId: string,
  comment: string,
  projectId: string
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("media")
      .update({ comment: comment.trim() || null })
      .eq("id", mediaId);

    if (error) throw new Error(error.message);

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Erreur updateMediaCommentAction:", error);
    return { success: false, error: error?.message || "Impossible d'enregistrer la note." };
  }
}

export async function transcribeAudioAction(
  mediaId: string,
  storagePathOrUrl: string,
  projectId: string
) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Clé GROQ_API_KEY non configurée.");

    const supabase = await createClient();

    let filePath = storagePathOrUrl;
    if (filePath.includes("/project-media/")) {
      filePath = filePath.split("/project-media/")[1];
    }
    filePath = decodeURIComponent(filePath);

    // 1. Récupération de l'audio depuis Supabase
    const { data: fileBlob, error: downloadErr } = await supabase.storage
      .from("project-media")
      .download(filePath);

    if (downloadErr || !fileBlob) {
      throw new Error("Fichier audio introuvable sur Supabase.");
    }

    // 2. Envoi direct à Groq Whisper (modèle ultra-rapide)
    const ext = filePath.split(".").pop() || "webm";
    const formData = new FormData();
    formData.append("file", fileBlob, `audio.${ext}`);
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", "fr");
    formData.append("prompt", "Rapport de chantier, travaux BTP, gros-oeuvre, finitions, électricité, plomberie, réserves.");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Erreur Groq:", errText);
      throw new Error("L'IA n'a pas pu traiter l'audio.");
    }

    const data = await groqRes.json();
    const transcription = data.text?.trim();

    if (!transcription) {
      throw new Error("Aucune parole détectée dans cet enregistrement.");
    }

    // 3. Sauvegarde automatique dans la colonne comment
    const { error: dbErr } = await supabase
      .from("media")
      .update({ comment: transcription })
      .eq("id", mediaId);

    if (dbErr) throw new Error(dbErr.message);

    revalidatePath(`/projects/${projectId}`);
    return { success: true, transcription };
  } catch (error: any) {
    console.error("Erreur transcribeAudioAction:", error);
    return { success: false, error: error?.message || "Échec de transcription." };
  }
}