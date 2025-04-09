import prisma from "../db/index.js";

// 🟢 Add a New Category
export const addCategory = async (req, res) => {
  try {
    const { title, link } = req.body;
    const imageFiles = req.files; // Uploaded images

    // Ensure required fields are provided
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Store local image paths
    const imageUrls = imageFiles ? imageFiles.map((file) => ({
      src: `/uploads/${file.filename}`, // Save relative path for images
    })) : [];

    // Create category
    const category = await prisma.category.create({
      data: {
        title,
        link,
        images: {
          create: imageUrls,
      },
      },
      include: {  images: true },
    });

    // // Create images if any were uploaded
    // if (imageUrls.length > 0) {
    //   const createdImages = await prisma.image.createMany({
    //     data: imageUrls,
    //   });

    //   // Link images to the category
    //   await prisma.image.updateMany({
    //     where: {
    //       id: {
    //         in: createdImages.ids,
    //       },
    //     },
    //     data: {
    //       categoryId: category.id,
    //     },
    //   });
    // }

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category", details: error.message });
  }
};
// 🟢 Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { images: true },
    });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories", details: error.message });
  }
};

// 🟢 Get Category by ID
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category", details: error.message });
  }
};

// 🟢 Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link } = req.body;
    const imageFiles = req.files;

    // Store local image paths (only if images are uploaded)
    const imageUrls = imageFiles ? imageFiles.map((file) => ({
      src: `/uploads/${file.filename}`, // Save relative path for images
    })) : [];

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        title,
        link,
        images: imageUrls.length ? { create: imageUrls } : undefined,
      },
      include: { images: true },
    });

    res.status(200).json({ category: updatedCategory });
  } catch (error) {
    res.status(500).json({ error: "Failed to update category", details: error.message });
  }
};

// 🟢 Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category", details: error.message });
  }
};
