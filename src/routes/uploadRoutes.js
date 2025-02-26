import express from 'express';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    imagePath: `/uploads/${req.file.filename}`,
  });
});

export default router;