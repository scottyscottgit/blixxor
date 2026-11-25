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