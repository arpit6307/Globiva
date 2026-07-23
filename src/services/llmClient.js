import { generateCourseFromPdf } from '../utils/pdfParser';

/**
 * LLM Client Service
 * Calls optional stateless proxy endpoint or executes client-side structured JSON course generation.
 */
export const generateCourseFromLlm = async (extractedText, fileName = 'Uploaded_Document.pdf') => {
  try {
    // Attempt optional stateless proxy endpoint call if configured
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.__SERVERLESS_LLM_ENDPOINT__) {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full_course', text: extractedText, fileName })
      });
      if (response.ok) {
        const json = await response.json();
        if (json && json.course) {
          return json.course;
        }
      }
    }
  } catch (err) {
    console.warn("Stateless proxy call skipped or unavailable. Falling back to in-browser JSON generator:", err);
  }

  // Guaranteed in-browser structured JSON course generation (10 visual scenes + 20 MCQs + 2 games)
  return generateCourseFromPdf(extractedText, fileName);
};
