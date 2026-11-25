"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Camera, Mic, StopCircle, Check, ArrowLeft, Loader2, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { saveMediaWithAutoTranscription } from "./actions";

function CaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const mode = searchParams.get("mode"); // 'photo' ou 'audio'

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://keyrrgnzseroyowxfrjql.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_4S0r3Hz8wXieNPJG7aj3nw_je-Dsbw4";
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Capture Photo
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Capture Audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File(
          [audioBlob],
          `audio-${Date.now()}.webm`,
          { type: "audio/webm" }
        );
        setFile(audioFile);
        setPreviewUrl(URL.createObjectURL(audioBlob));
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone inaccessible. Vérifiez les autorisations de votre navigateur.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream
      ?.getTracks()
      .forEach((track) => track.stop());
  };

  // Upload + Auto-Transcription IA
  const handleUpload = async () => {
    if (!file || !projectId) return;
    setUploading(true);
    setUploadStep(mode === "audio" ? "Envoi du fichier audio..." : "Envoi de la photo...");

    try {
      const fileExt = file.name ? file.name.split(".").pop() : (mode === "audio" ? "webm" : "jpg");
      const filePath = `${projectId}/${Date.now()}.${fileExt}`;

      // 1. Upload dans le bucket Supabase
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(filePath, file, {
          contentType: file.type || (mode === "audio" ? "audio/webm" : "image/jpeg"),
          upsert: true,
        });

      if (uploadError) {
        alert("Erreur Storage: " + uploadError.message);
        setUploading(false);
        return;
      }

      // 2. Transcription IA & Sauvegarde en base
      if (mode === "audio") {
        setUploadStep("Transcription de la voix par l'IA... ✨");
      }

      const res = await saveMediaWithAutoTranscription(
        projectId,
        mode || "photo",
        filePath
      );

      if (!res.success) {
        alert("Erreur enregistrement: " + res.error);
        setUploading(false);
        return;
      }

      // 3. Retour au chantier
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err: any) {
      alert("Erreur: " + (err?.message || "Une erreur est survenue"));
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      <Link
        href={`/projects/${projectId}`}
        className="absolute top-6 left-6 text-white/50 hover:text-white p-2"
      >
        <X className="w-8 h-8" />
      </Link>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <h1 className="text-xl font-light tracking-widest uppercase text-slate-300">
          Capture {mode === "photo" ? "Photo" : "Audio"}
        </h1>

        <div className="w-full aspect-square bg-slate-800/80 rounded-3xl overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-700 shadow-xl">
          {!previewUrl ? (
            mode === "photo" ? (
              <label className="cursor-pointer flex flex-col items-center gap-4 p-8">
                <div className="p-6 bg-blue-600 hover:bg-blue-500 rounded-full animate-pulse transition-colors">
                  <Camera className="w-12 h-12 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300">
                  Prendre une photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />
              </label>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-10 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isRecording
                    ? "bg-red-500 animate-pulse ring-8 ring-red-500/30"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isRecording ? (
                  <StopCircle className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </button>
            )
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              {mode === "photo" ? (
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full px-4 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Mic className="w-8 h-8" />
                  </div>
                  <audio src={previewUrl} controls className="w-full" />
                </div>
              )}
            </div>
          )}
        </div>

        {previewUrl && !uploading && (
          <div className="flex gap-4 w-full">
            <button
              onClick={() => {
                setPreviewUrl(null);
                setFile(null);
              }}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" /> REFAIRE
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 py-4 bg-white text-slate-900 hover:bg-slate-100 active:scale-95 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Check className="w-5 h-5 text-emerald-600" /> VALIDER
            </button>
          </div>
        )}

        {uploading && (
          <div className="flex flex-col items-center gap-3 bg-slate-800/90 px-6 py-4 rounded-2xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 text-indigo-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              {mode === "audio" && <Sparkles className="w-5 h-5 animate-bounce" />}
            </div>
            <p className="text-sm font-medium text-slate-200">{uploadStep}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CapturePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          Chargement...
        </div>
      }
    >
      <CaptureContent />
    </Suspense>
  );
}