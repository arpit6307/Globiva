import Anthropic from '@anthropic-ai/sdk';

const getAnthropicClient = () => {
  if (process.env.CLAUDE_API_KEY) {
    return new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }
  return null;
};

function generateFallbackMCQs(text) {
  const sentences = text.split('. ').filter(s => s.trim().length > 50).slice(0, 20);
  const mcqs = [];
  
  for (let i = 0; i < 20; i++) {
    const s = sentences[i] || 'This is a fallback generated sentence about the topic.';
    mcqs.push({
      question: `What is true about the following: "${s.substring(0, 30)}..."?`,
      options: [
        'It is exactly as stated in the text.',
        'It is the opposite of the text.',
        'It is completely unrelated.',
        'It is partially true.'
      ],
      correctAnswerIndex: 0,
      explanation: `The correct answer refers to the actual text content: "${s.substring(0, 100)}..."`
    });
  }
  return mcqs;
}

export async function generateMCQs(extractedText, courseTitle) {
  try {
    const anthropic = getAnthropicClient();
    
    if (!anthropic) {
      console.log('CLAUDE_API_KEY not found. Using fallback MCQ generator.');
      return generateFallbackMCQs(extractedText);
    }

    const systemPrompt = 'You are an expert educational assessment creator. Generate exactly 20 multiple-choice questions based on the provided document. Return ONLY a valid JSON array with no markdown, no code fences, no preamble. Each question must have: { "question": string, "options": [string, string, string, string], "correctAnswerIndex": number (0-3), "explanation": string (1-2 sentences) }. Questions must cover the document proportionally. All 4 options must be plausible. The correct answer must be factually accurate based on the document.';
    
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

    let responseText = await callClaude(`Course title: ${courseTitle}\n\nDocument text:\n${truncatedText}`);
    
    let mcqs;
    try {
      mcqs = JSON.parse(responseText);
      // Validate
      if (!Array.isArray(mcqs) || mcqs.length !== 20 || !mcqs.every(q => Array.isArray(q.options) && q.options.length === 4 && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3)) {
        throw new Error('Validation failed: Array length must be 20, options length 4, correctAnswerIndex 0-3');
      }
      return mcqs;
    } catch (error) {
      console.warn('First MCQ generation failed validation or parse, retrying:', error);
      responseText = await callClaude(`The previous output failed validation: ${error.message}. Please generate exactly 20 questions in a valid JSON array.\n\nCourse title: ${courseTitle}\n\nDocument text:\n${truncatedText}`);
      return JSON.parse(responseText);
    }
  } catch (error) {
    console.error('Error in generateMCQs:', error);
    throw error;
  }
}
