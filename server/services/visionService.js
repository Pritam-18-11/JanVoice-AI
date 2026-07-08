// Verifies uploaded photo evidence using Gemini Vision — confirms the photo
// actually shows the civic issue being claimed, and returns a confidence score.
export async function verifyImage(imageBuffer, mimeType, category) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { verified: false, classification: 'AI verification unavailable (GEMINI_API_KEY not configured)', confidence: 0 };
  }

  try {
    const base64Image = imageBuffer.toString('base64');

    const prompt = `You are a civic infrastructure inspector AI. Look at this photo and determine if it genuinely shows evidence of a "${category}" issue (e.g. broken road, waterlogging, garbage pile, damaged infrastructure, electrical fault, etc).
Respond ONLY with strict JSON, no markdown, no extra text, in this exact shape:
{"verified": true or false, "classification": "short description of what the image actually shows", "confidence": a number from 0 to 100}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Image } },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      verified: !!parsed.verified,
      classification: parsed.classification || 'Unable to classify image',
      confidence: Number(parsed.confidence) || 0,
    };
  } catch (err) {
    console.error('Gemini Vision error:', err.message);
    return { verified: false, classification: 'AI verification failed — will need manual review', confidence: 0 };
  }
}