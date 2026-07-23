import express from 'express';
import { getJob } from '../queue/jobManager.js';

const router = express.Router();

router.get('/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = getJob(jobId);
  
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  
  // Return everything except the full result for the status endpoint
  const statusInfo = { ...job };
  delete statusInfo.result;
  
  res.json({ success: true, status: statusInfo });
});

router.get('/result/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = getJob(jobId);
  
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  
  if (job.stage !== 'done') {
    return res.status(400).json({ success: false, error: 'Job is not completed yet' });
  }
  
  res.json({ success: true, result: job.result });
});

export default router;
