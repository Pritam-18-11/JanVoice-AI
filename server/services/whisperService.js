// Transcribes a voice note using Groq's hosted Whisper endpoint, and captures
// the detected spoken language — this is the visible proof of the platform's
// multilingual support (citizens can speak in any local language).
export async function transcribeAudio(buffer, filename = 'voice-note.webm', mimeType = 'audio/webm') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set — skipping speech-to-text.');
    return { text: null, language: null };
  }

  try {
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mimeType }), filename);
    form.append('model', 'whisper-large-v3');
    form.append('response_format', 'verbose_json'); // includes detected `language`

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!response.ok) {
      console.error('Whisper transcription failed:', await response.text());
      return { text: null, language: null };
    }

    const data = await response.json();
    return {
      text: data.text?.trim() || null,
      language: data.language || null, // e.g. "bengali", "hindi", "english"
    };
  } catch (err) {
    console.error('Whisper transcription error:', err.message);
    return { text: null, language: null };
  }
}