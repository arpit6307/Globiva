import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function extractTextFromPdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text.trim();
    if (!text || text.length < 100) {
      throw new Error('This PDF has no readable text. Please upload a text-based PDF.');
    }
    return {
      text,
      pageCount: data.numpages,
      charCount: text.length
    };
  } catch (error) {
    console.error('Error in extractTextFromPdf:', error);
    throw error;
  }
}
