'use client';

import { Suspense, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Camera, Mic, Square, ArrowLeft, Loader2, UploadCloud } from 'lucide-react';
import Link from 'next/link';

function CaptureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const supabase = createClient();

  // --- GESTION PHOTO ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    try {
      setLoading(true);
      setStatusMessage('Envoi de la photo...');

      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${projectId}/${Date.now()}.${fileExt}`;

      // 1. Upload dans le Bucket Storage "project-media"
      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Enregistrement dans la table "media"
      const { error: dbError } = await supabase.from('media').insert({
        project_id: projectId,
        file_path: filePath,
        media_type: 'image',
      });

      if (dbError) throw dbError;

      setStatusMessage('Photo enregistrée !');
      setTimeout(() => router.push(`/projects/${projectId}`), 1000);
    } catch (err: any) {
      alert(`Erreur d'upload : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- GESTION AUDIO ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Micro inaccessible. Note : HTTPS est requis pour le micro.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob || !projectId) return;
    try {
      setLoading(true);
      setStatusMessage('Envoi de la note vocale...');
      const filePath = `${projectId}/${Date.now()}.webm`;

      await supabase.storage.from('project-media').upload(filePath, audioBlob);
      await supabase.from('media').insert({
        project_id: projectId,
        file_path: filePath,
        media_type: 'audio',
      });

      setStatusMessage('Audio enregistré !');
      setTimeout(() => router.push(`/projects/${projectId}`), 1000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-8">
        <Link href={`/projects/${projectId}`} className="flex items-center gap-2 text-slate-400">
          <ArrowLeft className="w-4 h-4" /> Annuler
        </Link>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p>{statusMessage}</p>
          </div>
        ) : (
          <div className="space-y-12 py-10">
            {/* Zone Photo */}
            <label className="flex flex-col items-center gap-4 p-10 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/50 cursor-pointer">
              <Camera className="w-16 h-16 text-blue-400" />
              <span className="font-medium text-lg">Prendre une photo</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
            </label>

            <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="px-4 text-slate-600 text-sm">OU</span>
                <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Zone Audio */}
            <div className="flex flex-col items-center gap-6 p-8 bg-slate-800 rounded-3xl">
              <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
              
              {!isRecording && !audioBlob && (
                <button onClick={startRecording} className="w-full py-4 bg-emerald-600 rounded-xl font-bold">Démarrer Micro</button>
              )}
              {isRecording && (
                <button onClick={stopRecording} className="w-full py-4 bg-red-600 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Square className="w-4 h-4 fill-current" /> Arrêter
                </button>
              )}
              {audioBlob && !isRecording && (
                <button onClick={uploadAudio} className="w-full py-4 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2">
                  <UploadCloud className="w-5 h-5" /> Enregistrer la note
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Chargement...</div>}>
      <CaptureContent />
    </Suspense>
  );
}