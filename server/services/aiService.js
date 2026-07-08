// Core AI triage engine — takes the raw citizen complaint text (+ transcribed
// voice note) and returns a structured summary, severity, priority score,
// impact estimate, and recommendation, using Gemini.
export async function analyzeComplaint({ description, voiceText, category, landmark, areaName, imageVerified, imageConfidence }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Graceful fallback so the app still works end-to-end without an API key configured
  if (!apiKey) {
    return {
      summary: description.slice(0, 140),
      severity: 'Medium',
      impact: 'Impact assessment pending — configure GEMINI_API_KEY to enable AI analysis',
      peopleAffected: 'Unknown',
      recommendation: 'AI recommendation pending — configure GEMINI_API_KEY',
      priorityScore: 50,
      confidenceScore: 0,
    };
  }

  const combinedText = [description, voiceText ? `Voice note transcript: ${voiceText}` : null].filter(Boolean).join('\n\n');

  const prompt = `You are the AI triage engine for a citizen grievance platform used by local government representatives (MP/MLA) in India.

Analyze this citizen complaint and respond ONLY with strict JSON (no markdown, no extra commentary) in this exact shape:
{
  "summary": "one crisp sentence describing the core problem",
  "severity": "Low" or "Medium" or "High",
  "impact": "one short sentence describing the real-world impact",
  "peopleAffected": "an estimated number range as a string, e.g. '500+' or '2,000+'",
  "recommendation": "one concrete, actionable solution a municipal authority could implement",
  "priorityScore": a number from 0 to 100 combining severity, population affected, and infrastructure importance,
  "confidenceScore": a number from 0 to 100 representing how confident you are in this analysis given the information provided
}

Complaint details:
Category: ${category}
Landmark: ${landmark || 'Not specified'}
Area: ${areaName || 'Not specified'}
Photo evidence verified by vision AI: ${imageVerified ? `Yes (${imageConfidence}% confidence)` : 'No image or unverified'}
Citizen's description:
${combinedText}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || combinedText.slice(0, 140),
      severity: ['Low', 'Medium', 'High'].includes(parsed.severity) ? parsed.severity : 'Medium',
      impact: parsed.impact || 'Impact assessment unavailable',
      peopleAffected: parsed.peopleAffected || 'Unknown',
      recommendation: parsed.recommendation || 'No recommendation generated',
      priorityScore: Number(parsed.priorityScore) || 50,
      confidenceScore: Number(parsed.confidenceScore) || 50,
    };
  } catch (err) {
    console.error('Gemini text analysis error:', err.message);
    return {
      summary: description.slice(0, 140),
      severity: 'Medium',
      impact: 'AI analysis failed — will need manual review',
      peopleAffected: 'Unknown',
      recommendation: 'AI recommendation unavailable due to a processing error',
      priorityScore: 50,
      confidenceScore: 0,
    };
  }
}