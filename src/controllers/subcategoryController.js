import prisma from "../db/index.js";

// 🟢 Add a New SubCategory
export const addSubCategory = async (req, res) => {
  try {
    const { title, categoryId } = req.body;
    const imageFiles = req.files; // Uploaded images

    // Ensure required fields are provided
    if (!title || !categoryId) {
      return res.status(400).json({ error: "Title and categoryId are required" });
    }

    // Validate category existence
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Store local image paths
    const imageUrls = imageFiles
      ? imageFiles.map((file) => ({
          src: `/uploads/${file.filename}`, // Save relative path for images
        }))
      : [];

    // Create subcategory
    const subCategory = await prisma.subCategory.create({
      data: {
        title,
        categoryId: parseInt(categoryId),
        images: {
          create: imageUrls,
        },
      },
      include: { images: true, category: true },
    });

    res.status(201).json({ subCategory });
  } catch (error) {
    res.status(500).json({ error: "Failed to create subcategory", details: error.message });
  }
};

// 🟢 Get All SubCategories
export const getSubCategories = async (req, res) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: { images: true, category: true },
    });
    res.status(200).json({ subCategories });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subcategories", details: error.message });
  }
};

// 🟢 Get SubCategory by ID
export const getSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: parseInt(id) },
      include: { images: true, category: true },
    });

    if (!subCategory) {
      return res.status(404).json({ error: "SubCategory not found" });
    }

    res.status(200).json({ subCategory });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subcategory", details: error.message });
  }
};

// 🟢 Update SubCategory
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, categoryId } = req.body;
    const imageFiles = req.files;

    // Validate subcategory existence
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: parseInt(id) },
    });
    if (!subCategory) {
      return res.status(404).json({ error: "SubCategory not found" });
    }

    // Validate category existence if categoryId is provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    // Store local image paths (only if images are uploaded)
    const imageUrls = imageFiles
      ? imageFiles.map((file) => ({
          src: `/uploads/${file.filename}`, // Save relative path for images
        }))
      : [];

    const updatedSubCategory = await prisma.subCategory.update({
      where: { id: parseInt(id) },
      data: {
        title,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        images: imageUrls.length ? { create: imageUrls } : undefined,
      },
      include: { images: true, category: true },
    });

    res.status(200).json({ subCategory: updatedSubCategory });
  } catch (error) {
    res.status(500).json({ error: "Failed to update subcategory", details: error.message });
  }
};

// 🟢 Delete SubCategory
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate subcategory existence
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: parseInt(id) },
    });
    if (!subCategory) {
      return res.status(404).json({ error: "SubCategory not found" });
    }

    await prisma.subCategory.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "SubCategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subcategory", details: error.message });
  }
};