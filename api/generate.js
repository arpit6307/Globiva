/**
 * Stateless Serverless Proxy Endpoint for Claude API (e.g. Vercel / Netlify Function)
 * Note: Keeps API key secret. Does NOT store files or database records.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, text, fileName } = req.body || {};
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY environment variable not configured.' });
  }

  try {
    const prompt = `You are a course architect. Return ONLY valid JSON (no markdown formatting, no codeblocks).
Analyze the following text from "${fileName}":
"${text.substring(0, 8000)}"

Return a JSON object with:
- title: string
- chapters: array of { chapterTitle, summary, keyPoints }
- scenes: array of 10 scenes with { sceneId, title, subtitle, visualType ("heading-intro" | "bullet-list" | "comparison-table" | "timeline" | "quote-highlight" | "diagram-placeholder"), visualData, narration, dialogues }
- mcqs: array of exactly 20 MCQs with { id, question, options (4 strings), correctIndex (0-3), explanation }`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Claude API returned error: ${errText}` });
    }

    const data = await response.json();
    const contentText = data.content?.[0]?.text || '';
    const cleanJsonText = contentText.replace(/```json/g, '').replace(/```/g, '').trim();
    const courseJson = JSON.parse(cleanJsonText);

    return res.status(200).json({ course: courseJson });
  } catch (error) {
    console.error("Serverless proxy error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
