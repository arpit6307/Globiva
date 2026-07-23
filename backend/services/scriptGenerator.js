import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

const getAnthropicClient = () => {
  if (process.env.CLAUDE_API_KEY) {
    return new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }
  return null;
};

function generateFallbackScenes(chapters) {
  const scenes = [];
  for (const chapter of chapters) {
    scenes.push({
      sceneId: uuidv4(),
      sceneText: `Welcome to ${chapter.chapterTitle}. ${chapter.summary}`,
      visualCue: 'intro-title',
      durationHint: 15,
      keyHighlights: ['Welcome', chapter.chapterTitle]
    });
    for (const point of chapter.keyPoints) {
      scenes.push({
        sceneId: uuidv4(),
        sceneText: `A key point here is: ${point}. This is crucial for understanding the topic.`,
        visualCue: 'bullet-list',
        durationHint: 10,
        keyHighlights: [point]
      });
    }
  }
  return {
    scenes,
    characters: {
      speaker1: { name: 'Alex', role: 'Instructor', avatar: 'teacher1', voiceGender: 'male' },
      speaker2: { name: 'Sam', role: 'Student', avatar: 'student1', voiceGender: 'female' }
    }
  };
}

export async function generateChapterScripts(chapters, extractedText) {
  try {
    const anthropic = getAnthropicClient();
    
    if (!anthropic) {
      console.log('CLAUDE_API_KEY not found. Using fallback script generator.');
      return generateFallbackScenes(chapters);
    }

    const systemPrompt = `You are an expert video script writer and instructional designer. 
    Based on the provided chapters, generate 4-8 scenes for each chapter.
    Return ONLY valid JSON with no markdown formatting.
    Format:
    {
      "scenes": [
        {
          "sceneId": "uuid-string",
          "sceneText": "narration text here",
          "visualCue": "one of: 'intro-title', 'bullet-list', 'comparison-table', 'timeline', 'diagram-placeholder', 'quote-highlight', 'chapter-summary'",
          "durationHint": number (seconds),
          "keyHighlights": ["string"]
        }
      ],
      "characters": {
        "speaker1": { "name": "string", "role": "string", "avatar": "string", "voiceGender": "string" },
        "speaker2": { "name": "string", "role": "string", "avatar": "string", "voiceGender": "string" }
      }
    }`;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: JSON.stringify(chapters) }
      ]
    });
    
    let result = JSON.parse(response.content[0].text);
    // Ensure all scenes have valid ids
    result.scenes = result.scenes.map(s => ({...s, sceneId: s.sceneId || uuidv4()}));
    return result;
  } catch (error) {
    console.error('Error in generateChapterScripts:', error);
    throw error;
  }
}
