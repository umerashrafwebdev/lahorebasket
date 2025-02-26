import express from 'express';
import { LoginUser, registerUser,getMe } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', LoginUser);
// router.post("/logout",authMiddleware, logoutUser);
router.get('/me', authMiddleware, getMe); // Protected route
export default router;