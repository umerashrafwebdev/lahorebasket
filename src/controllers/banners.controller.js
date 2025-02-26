import prisma from '../db/index.js';

import Joi from 'joi';
import path from 'path';
// Get all banners
export const getBanners = async (req, res) => {
    try {
        const banners = await prisma.banner.findMany();
        res.json({ banners });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch banners" });
    }
};

// Add a new banner
const bannerCreateSchema = Joi.object({
    link: Joi.string().allow('').optional(),
    position: Joi.number().integer().min(0).required(),
    type: Joi.string().valid('general', 'discount', 'homepage').required(),
    status: Joi.string().valid('active', 'inactive').required(),
  });
  
  const bannerUpdateSchema = Joi.object({
    link: Joi.string().allow('').optional(),
    position: Joi.number().integer().min(0).optional(),
    type: Joi.string().valid('general', 'discount', 'homepage').optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  
  export const addBanner = async (req, res) => {
    try {
      // Validate image upload
      if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
      }
  
      // Validate request body
      const { error } = bannerCreateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }
  
      // Generate image URL (relative path)
      const imageUrl = `/uploads/${req.file.filename}`;
  
      // Create banner
      const banner = await prisma.banner.create({
        data: {
          imageUrl,
          link: req.body.link || '',
          position: parseInt(req.body.position),
          type: req.body.type.toUpperCase(),
          status: req.body.status.toUpperCase(),
        },
      });
  
      res.status(201).json({ banner });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add banner',details: error.message });
    }
  };
  
  export const updateBanner = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find existing banner
      const existingBanner = await prisma.banner.findUnique({ where: { id: Number(id) } });
      if (!existingBanner) {
        return res.status(404).json({ error: 'Banner not found' });
      }
  
      // Validate request body
      const { error } = bannerUpdateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }
  
      // Prepare update data
      const data = {};
  
      if (req.body.link !== undefined) data.link = req.body.link;
      if (req.body.position !== undefined) data.position = parseInt(req.body.position);
      if (req.body.type !== undefined) data.type = req.body.type.toUpperCase();
      if (req.body.status !== undefined) data.status = req.body.status.toUpperCase();
      if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
  
      // Update banner
      const updatedBanner = await prisma.banner.update({
        where: { id: Number(id) },
        data,
      });
  
      res.json({ banner: updatedBanner });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update banner' });
    }
  };
  

// Delete a banner
export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.banner.delete({
            where: { id: Number(id) },
        });

        res.json({ message: "Banner deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete banner" });
    }
};