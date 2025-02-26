import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorizeRoles from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/admin-data', authMiddleware, authorizeRoles('admin'), (req, res) => {
    res.json({ message: "Welcome, Admin! You have full access." });
});

export default router;