// Transcribes a recorded voice note using Groq's hosted Whisper endpoint.
// Requires Node.js 18+ (uses the built-in fetch, FormData, and Blob globals).
export async function transcribeAudio(buffer, filename = 'voice-note.webm', mimeType = 'audio/webm') {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn('GROQ_API_KEY not set — skipping speech-to-text.');
    return null;
  }

  try {
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mimeType }), filename);
    form.append('model', 'whisper-large-v3');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!response.ok) {
      console.error('Whisper transcription failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.text?.trim() || null;
  } catch (err) {
    console.error('Whisper transcription error:', err.message);
    return null;
  }
}