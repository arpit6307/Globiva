import express from 'express';
import multer from 'multer';
import { createJob } from '../queue/jobManager.js';
import { processCourseGeneration } from '../queue/processor.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf files are allowed'));
    }
  }
});

router.post('/', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file provided' });
    }

    const courseId = `course-pdf-${Date.now()}`;
    const jobId = createJob(courseId);

    // Start background processing
    processCourseGeneration(jobId, req.file.buffer, req.file.originalname)
      .then(() => console.log(`Background processing finished for job ${jobId}`))
      .catch(err => console.error(`Background processing failed for job ${jobId}`, err));

    res.json({ success: true, jobId, courseId });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
