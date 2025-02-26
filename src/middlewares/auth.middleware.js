import jwt from 'jsonwebtoken';
import prisma from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dsadsadsvdcve32r3frverr3eefervxw32';

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch user from DB to ensure they exist
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.user = user; // Attach user object to request
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

export default authMiddleware;