'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Camera, Mic, StopCircle, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function CaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const mode = searchParams.get('mode'); // 'photo' ou 'audio'
  const supabase = createClient();

  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- LOGIQUE PHOTO ---
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // --- LOGIQUE AUDIO ---
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
      setFile(audioFile);
      setPreviewUrl(URL.createObjectURL(audioBlob));
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
  };

  // --- ENVOI VERS SUPABASE ---
  const handleUpload = async () => {
    if (!file || !projectId) return;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 1. Upload dans le Storage
      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Enregistrer dans la table "media" (optionnel mais recommandé)
      const { error: dbError } = await supabase.from('media').insert({
        project_id: projectId,
        type: mode,
        url: filePath,
      });

      if (dbError) throw dbError;

      router.push(`/project/${projectId}`);
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      <Link href={`/project/${projectId}`} className="absolute top-6 left-6 text-white/50 hover:text-white">
        <X className="w-8 h-8" />
      </Link>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <h1 className="text-xl font-light tracking-widest uppercase">
          Capture {mode === 'photo' ? 'Photo' : 'Audio'}
        </h1>

        {/* ZONE DE PREVIEW */}
        <div className="w-full aspect-square bg-slate-800 rounded-3xl overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-700">
          {!previewUrl ? (
            mode === 'photo' ? (
              <label className="cursor-pointer flex flex-col items-center gap-4">
                <div className="p-6 bg-blue-600 rounded-full animate-pulse">
                  <Camera className="w-12 h-12" />
                </div>
                <span className="text-sm font-medium">Prendre une photo</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
              </label>
            ) : (
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-10 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'}`}
              >
                {isRecording ? <StopCircle className="w-16 h-16" /> : <Mic className="w-16 h-16" />}
              </button>
            )
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              {mode === 'photo' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <audio src={previewUrl} controls className="w-full" />
              )}
            </div>
          )}
        </div>

        {/* ACTIONS APRES CAPTURE */}
        {previewUrl && !uploading && (
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => { setPreviewUrl(null); setFile(null); }}
              className="flex-1 py-4 bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> REFAIRE
            </button>
            <button 
              onClick={handleUpload}
              className="flex-1 py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> VALIDER
            </button>
          </div>
        )}

        {uploading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p>Envoi en cours...</p>
          </div>
        )}
      </div>
    </main>
  );
}

// Composant principal avec Suspense pour useSearchParams()
export default function CapturePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Chargement...</div>}>
      <CaptureContent />
    </Suspense>
  );
}