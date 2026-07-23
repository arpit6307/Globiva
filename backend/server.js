import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import uploadRouter from './routes/upload.js';
import statusRouter from './routes/status.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup directories
const storageDir = path.join(process.cwd(), 'storage');
const coursesDir = path.join(storageDir, 'courses');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}
if (!fs.existsSync(coursesDir)) {
  fs.mkdirSync(coursesDir, { recursive: true });
}

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Mount routes
app.use('/api/upload', uploadRouter);
app.use('/api/status', statusRouter);
app.use('/api/files', express.static(storageDir));

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`GlobivaLearn Backend Started!`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`=================================`);
});
