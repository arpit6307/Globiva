import { v4 as uuidv4 } from 'uuid';

const jobs = new Map();

export function createJob(courseId) {
  const jobId = uuidv4();
  jobs.set(jobId, {
    id: jobId,
    courseId,
    stage: 'queued',
    progress: 0,
    detail: 'Job queued',
    error: null,
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return jobId;
}

export function updateJobStage(jobId, stage, progress, detail) {
  const job = jobs.get(jobId);
  if (job) {
    job.stage = stage;
    job.progress = progress;
    job.detail = detail;
    job.updatedAt = new Date().toISOString();
    jobs.set(jobId, job);
  }
}

export function getJob(jobId) {
  return jobs.get(jobId);
}

export function failJob(jobId, error) {
  const job = jobs.get(jobId);
  if (job) {
    job.stage = 'failed';
    job.error = error;
    job.updatedAt = new Date().toISOString();
    jobs.set(jobId, job);
  }
}

export function completeJob(jobId, result) {
  const job = jobs.get(jobId);
  if (job) {
    job.stage = 'done';
    job.progress = 100;
    job.detail = 'Job completed successfully';
    job.result = result;
    job.updatedAt = new Date().toISOString();
    jobs.set(jobId, job);
  }
}
