import { updateJobStage, completeJob, failJob } from './jobManager.js';
import { extractTextFromPdf } from '../services/pdfExtract.js';
import { generateCourseOutline } from '../services/llmAnalysis.js';
import { generateMCQs } from '../services/mcqGenerator.js';
import { generateChapterScripts } from '../services/scriptGenerator.js';
import { generateAudio } from '../services/ttsService.js';
import { renderVideo } from '../services/videoRenderer.js';
import path from 'path';

export async function processCourseGeneration(jobId, pdfBuffer, originalFilename) {
  try {
    console.log(`[Job ${jobId}] Starting processCourseGeneration for ${originalFilename}`);
    
    // 1. Extract text
    updateJobStage(jobId, 'extracting', 10, 'Extracting text from PDF');
    const { text, pageCount } = await extractTextFromPdf(pdfBuffer);
    console.log(`[Job ${jobId}] Extracted ${text.length} chars from ${pageCount} pages`);

    // 2. Analyze and generate outline
    updateJobStage(jobId, 'analyzing', 25, 'Generating course outline');
    const outline = await generateCourseOutline(text, originalFilename);
    console.log(`[Job ${jobId}] Outline generated with ${outline.chapters?.length || 0} chapters`);

    // 3. Parallel tasks
    updateJobStage(jobId, 'scripting', 40, 'Generating scripts and MCQs'); // Using scripting to indicate dual progress conceptually
    const [mcqs, scriptData] = await Promise.all([
      generateMCQs(text, outline.title),
      generateChapterScripts(outline.chapters, text)
    ]);
    console.log(`[Job ${jobId}] MCQs and Scripts generated`);

    // 4. TTS
    updateJobStage(jobId, 'creating_narration', 75, 'Creating narration audio');
    const audioFiles = [];
    if (scriptData?.scenes) {
      for (const scene of scriptData.scenes) {
        const audioPath = path.join(process.cwd(), 'storage', 'courses', `${jobId}_${scene.sceneId}.mp3`);
        const audio = await generateAudio(scene.sceneText, 'defaultVoice', audioPath);
        if (audio) {
          audioFiles.push(audio);
        }
      }
    }

    // 5. Video Rendering
    updateJobStage(jobId, 'rendering_video', 90, 'Rendering video components');
    const videoUrl = await renderVideo(jobId, scriptData.scenes, audioFiles);

    // 6. Complete Job
    completeJob(jobId, {
      outline,
      mcqs,
      scenes: scriptData.scenes,
      characters: scriptData.characters,
      videoUrl
    });
    console.log(`[Job ${jobId}] Processing completed successfully`);

  } catch (error) {
    console.error(`[Job ${jobId}] Processing failed:`, error);
    failJob(jobId, error.message);
  }
}
