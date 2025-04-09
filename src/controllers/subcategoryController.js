// subcategoryController.js
import prisma from "../db/index.js";

// 🟢 Add a New SubCategory
export const addSubCategory = async (req, res) => {
  try {
    const { title, categoryId } = req.body;

    // Ensure required fields are provided
    if (!title || !categoryId) {
      return res.status(400).json({ error: "Title and categoryId are required" });
    }

    // Check if the parent category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!categoryExists) {
      return res.status(404).json({ error: "Parent category not found" });
    }

    // Create subcategory
    const subCategory = await prisma.subCategory.create({
      data: {
        title,
        categoryId: parseInt(categoryId),
      },
      include: { category: true }, // Include parent category in response
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
      include: { category: true, products: true }, // Include related category and products
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
      include: { category: true, products: true }, // Include related data
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

    // Validate required fields
    if (!id || !title) {
      return res.status(400).json({ error: "ID and title are required" });
    }

    // Check if subcategory exists
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingSubCategory) {
      return res.status(404).json({ error: "SubCategory not found" });
    }

    // If categoryId is provided, ensure it exists
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!categoryExists) {
        return res.status(404).json({ error: "Parent category not found" });
      }
    }

    // Update subcategory
    const updatedSubCategory = await prisma.subCategory.update({
      where: { id: parseInt(id) },
      data: {
        title,
        categoryId: categoryId ? parseInt(categoryId) : existingSubCategory.categoryId, // Keep existing if not provided
      },
      include: { category: true },
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

    // Check if subcategory exists
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