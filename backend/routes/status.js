import express from 'express';
import { getJob } from '../queue/jobManager.js';

const router = express.Router();

router.get('/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = getJob(jobId);
  
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  
  // Return full job data including result when done
  res.json(job);
});

export default router;
