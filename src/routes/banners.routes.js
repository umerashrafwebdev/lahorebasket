import express from 'express';
import { addBanner, updateBanner, deleteBanner, getBanners } from '../controllers/banners.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
// import upload from '../middlewares/upload.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
// app.post('/api/banners', upload.single('image'), addBanner);
const router = express.Router();

// Public route
router.get('/', getBanners);

// Protected routes
// router.post('/', authMiddleware, upload.single('image'), addBanner);
router.post('/', upload.single('images'), addBanner);


router.put('/:id', authMiddleware, upload.single('image'), updateBanner);
router.delete('/:id', authMiddleware, deleteBanner);

export default router;