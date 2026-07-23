import Anthropic from '@anthropic-ai/sdk';

const getAnthropicClient = () => {
  if (process.env.CLAUDE_API_KEY) {
    return new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }
  return null;
};

function generateFallbackOutline(text, title) {
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
  const chapters = [];
  const chunkSize = Math.max(1, Math.floor(paragraphs.length / 5));
  
  for (let i = 0; i < 5; i++) {
    if (i * chunkSize >= paragraphs.length) break;
    const chunk = paragraphs.slice(i * chunkSize, (i + 1) * chunkSize).join(' ');
    chapters.push({
      chapterTitle: `Chapter ${i + 1}`,
      summary: chunk.substring(0, 200) + '...',
      keyPoints: [
        'Introduction to concepts',
        'Main discussion points',
        'Summary of section'
      ]
    });
  }
  
  return {
    title: title || 'Generated Course',
    chapters
  };
}

export async function generateCourseOutline(extractedText, title) {
  try {
    const anthropic = getAnthropicClient();
    
    if (!anthropic) {
      console.log('CLAUDE_API_KEY not found. Using fallback outline generator.');
      return generateFallbackOutline(extractedText, title);
    }

    const systemPrompt = 'You are an expert instructional designer. Analyze the provided document text and create a structured course outline. Return ONLY valid JSON with no markdown formatting, no code fences, no preamble. The JSON must have this exact structure: { "title": string, "chapters": [{ "chapterTitle": string, "summary": string, "keyPoints": [string] (3-6 items) }] }. Create 5-10 chapters covering all the document content proportionally.';
    
    const truncatedText = extractedText.substring(0, 80000);
    
    const callClaude = async (promptMsg) => {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: promptMsg }
        ]
      });
      return response.content[0].text;
    };

    let responseText = await callClaude(`Course title (if any): ${title}\n\nDocument text:\n${truncatedText}`);
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.warn('First JSON parse failed, retrying with stricter prompt:', parseError);
      responseText = await callClaude(`The previous output was not valid JSON. Parse error: ${parseError.message}. Please return ONLY valid JSON with no markdown block formatting.\n\nCourse title (if any): ${title}\n\nDocument text:\n${truncatedText}`);
      return JSON.parse(responseText);
    }
  } catch (error) {
    console.error('Error in generateCourseOutline:', error);
    throw error;
  }
}
