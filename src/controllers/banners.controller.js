import prisma from '../db/index.js';
import Joi from 'joi';
import path from 'path';

export const getBanners = async (req, res) => {
    try {
        const banners = await prisma.banner.findMany();
        res.json({ banners });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch banners", details: error.message });
    }
};

const bannerCreateSchema = Joi.object({
    link: Joi.string().allow('').optional(),
    position: Joi.number().integer().min(0).required(),
    type: Joi.string().valid('general', 'discount', 'homepage', 'fourinone').required(),
    status: Joi.string().valid('active', 'inactive').required(),
});

const bannerUpdateSchema = Joi.object({
    link: Joi.string().allow('').optional(),
    position: Joi.number().integer().min(0).optional(),
    type: Joi.string().valid('general', 'discount', 'homepage', 'fourinone').optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
});

export const addBanner = async (req, res) => {
  try {
      console.log('req.body:', req.body);
      console.log('req.files:', req.files);

      if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'At least one image is required' });
      }

      const { error } = bannerCreateSchema.validate(req.body);
      if (error) {
          return res.status(400).json({ error: 'Validation failed', details: error.details });
      }

      const imageUrl = path.join('/uploads', req.files[0].filename);

      const bannerData = {
          imageUrl,
          link: req.body.link || '',
          position: parseInt(req.body.position),
          type: req.body.type.toUpperCase(),
          status: req.body.status.toUpperCase(),
      };
      console.log('Creating banner with data:', bannerData);

      const banner = await prisma.banner.create({
          data: bannerData,
      });

      console.log('Banner created:', banner);
      res.status(201).json({ banner });
      console.log('Response sent');
  } catch (error) {
      console.error('Prisma error:', error);
      res.status(500).json({ error: 'Failed to create banner', details: error.message });
  }
};
export const updateBanner = async (req, res) => {
    try {
        // Log incoming data for debugging
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        const { id } = req.params;

        const existingBanner = await prisma.banner.findUnique({ where: { id: Number(id) } });
        if (!existingBanner) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        const { error } = bannerUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ errors: error.details });
        }

        const data = {};
        if (req.body.link !== undefined) data.link = req.body.link;
        if (req.body.position !== undefined) data.position = parseInt(req.body.position);
        if (req.body.type !== undefined) data.type = req.body.type.toUpperCase();
        if (req.body.status !== undefined) data.status = req.body.status.toUpperCase();
        if (req.files && req.files.length > 0) data.imageUrl = path.join('/uploads', req.files[0].filename);

        const updatedBanner = await prisma.banner.update({
            where: { id: Number(id) },
            data,
        });

        res.json({ banner: updatedBanner });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update banner', details: error.message });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const existingBanner = await prisma.banner.findUnique({ where: { id: Number(id) } });
        if (!existingBanner) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        await prisma.banner.delete({
            where: { id: Number(id) },
        });

        res.json({ message: "Banner deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete banner", details: error.message });
    }
};