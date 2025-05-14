import express from 'express';
import { addBanner, updateBanner, deleteBanner, getBanners } from '../controllers/banners.controller.js';
import upload from '../middlewares/upload.js'; 
import path from 'path';

const router = express.Router();

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({ storage });

// Routes without authMiddleware
router.get('/', getBanners);
router.post('/', upload.array("images", 5), addBanner);
router.put('/:id', upload.array("images", 5), updateBanner);
router.delete('/:id', deleteBanner);

export default router;