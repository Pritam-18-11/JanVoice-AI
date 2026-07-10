// Converts an MLA's natural-language dashboard question into a structured
// filter object the frontend can apply directly — this is the real AI
// Assistant behind "Show top 5 road issues", "unresolved drainage in Ward 10", etc.
const CATEGORIES = [
  'Road Infrastructure', 'Drainage & Sewerage', 'Electricity & Lighting',
  'Water Supply', 'Solid Waste & Garbage', 'Public Transport',
  'Healthcare/Hospitals', 'School Infrastructure', 'Agriculture Development',
];

export async function interpretQuery(naturalLanguageQuery) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      category: 'All', status: 'All', ward: null, sortBy: 'priority', limit: null, searchTerm: null,
      reply: 'AI Assistant is unavailable (GEMINI_API_KEY not configured) — showing all records instead.',
    };
  }

  const prompt = `You are a query-interpretation engine for a civic grievance dashboard used by an elected representative (MP/MLA).

Convert their natural-language request into a structured JSON filter. Respond ONLY with strict JSON (no markdown, no extra text), in this exact shape:
{
  "category": one of ${JSON.stringify(['All', ...CATEGORIES])},
  "status": "All" or "Pending" or "Resolved",
  "ward": a ward name string mentioned in the query, or null if none mentioned,
  "sortBy": "priority" or "date",
  "limit": a number if the user asked for a specific count (e.g. "top 5"), otherwise null,
  "searchTerm": a keyword to search titles/descriptions with if nothing else fits, otherwise null,
  "reply": "one short, friendly sentence telling the representative what you're now showing them"
}

Representative's request: "${naturalLanguageQuery}"`;

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
      category: CATEGORIES.includes(parsed.category) ? parsed.category : 'All',
      status: ['All', 'Pending', 'Resolved'].includes(parsed.status) ? parsed.status : 'All',
      ward: parsed.ward || null,
      sortBy: parsed.sortBy === 'date' ? 'date' : 'priority',
      limit: Number.isInteger(parsed.limit) ? parsed.limit : null,
      searchTerm: parsed.searchTerm || null,
      reply: parsed.reply || 'Here are the filtered results.',
    };
  } catch (err) {
    console.error('AI query interpretation error:', err.message);
    return {
      category: 'All', status: 'All', ward: null, sortBy: 'priority', limit: null, searchTerm: naturalLanguageQuery,
      reply: `I couldn't fully parse that — searching for "${naturalLanguageQuery}" instead.`,
    };
  }
}