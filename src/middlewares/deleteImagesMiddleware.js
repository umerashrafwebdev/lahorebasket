import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const deleteProductImages = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Fetch product images
    const images = await prisma.image.findMany({
      where: { productId },
    });

    // Delete image files from local storage
    images.forEach((image) => {
      const imagePath = path.join('uploads/', path.basename(image.src));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    // Continue to the next middleware (delete product)
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting images", details: error.message });
  }
};

export default deleteProductImages;
