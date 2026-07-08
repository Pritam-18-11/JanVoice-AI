import React, { useState, useRef } from 'react';
import { Mic, Square, RotateCcw, Volume2, Check } from 'lucide-react';

export default function VoiceRecorder({ onVoiceRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onVoiceRecorded({ voiceBlob: blob, voiceUrl: url });
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setAudioUrl(null);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Microphone access denied. Please allow microphone permissions to record a voice note.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    onVoiceRecorded({ voiceBlob: null, voiceUrl: null });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-100/80 bg-white/60 relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {isRecording ? (
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block mr-1"></span>
              <span className="text-red-500">Live Recording</span>
            </span>
          ) : audioUrl ? (
            <span className="text-green-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Audio Ready
            </span>
          ) : (
            <span>Voice Input (Optional)</span>
          )}
        </div>

        <div className="w-full flex justify-center items-center h-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 relative overflow-hidden">
          {isRecording ? (
            <div className="flex items-center space-x-[3px] px-8">
              {[...Array(24)].map((_, i) => {
                const randomDelay = Math.random() * 0.8;
                const randomHeight = 20 + Math.random() * 40;
                return (
                  <span
                    key={i}
                    className="w-[3px] bg-red-500 rounded-full"
                    style={{ height: `${randomHeight}px`, animation: `pulse 0.6s ease-in-out infinite alternate`, animationDelay: `${randomDelay}s` }}
                  />
                );
              })}
            </div>
          ) : audioUrl ? (
            <div className="flex flex-col items-center gap-1.5 text-green-600 w-full px-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                <span className="text-xs font-semibold">Recording captured</span>
              </div>
              <audio controls src={audioUrl} className="w-full h-8" />
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">Press Record to speak in your local language</p>
          )}

          {isRecording && (
            <div className="absolute right-4 text-xs font-mono font-bold bg-slate-900/5 text-slate-600 px-2 py-1 rounded">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {!isRecording && !audioUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 animate-pulse"
            >
              <Square className="w-5 h-5" />
            </button>
          )}

          {audioUrl && (
            <button
              type="button"
              onClick={resetRecording}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-record
            </button>
          )}
        </div>

        {error && (
          <div className="w-full text-center p-2.5 bg-red-50 rounded-xl border border-red-100 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          Your voice note will be transcribed by Whisper AI (Groq) once you submit the grievance — the text will appear on your tracking page.
        </p>
      </div>
    </div>
  );
}