import prisma from "../db/index.js";

// 🟢 Add a New Product
export const addProduct = async (req, res) => {
  try {
    const { title, body_html, vendor, product_type, categoryId, subCategoryId, variants, tags, isFeatured, status } = req.body;
    const imageFiles = req.files; // Uploaded images

    // Ensure required fields are provided
    if (!title || !vendor || !product_type) {
      return res.status(400).json({ error: "Title, vendor, and product type are required" });
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ error: "At least one variant is required" });
    }

    // Validate categoryId if provided
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!categoryExists) {
        return res.status(400).json({ error: "Invalid categoryId: Category not found" });
      }
    }

    // Validate subCategoryId if provided
    if (subCategoryId) {
      const subCategoryExists = await prisma.subCategory.findUnique({
        where: { id: parseInt(subCategoryId) },
      });
      if (!subCategoryExists) {
        return res.status(400).json({ error: "Invalid subCategoryId: SubCategory not found" });
      }
    }

    // Validate status if provided
    const validStatuses = ["ACTIVE", "DRAFT"];
    const productStatus = status && validStatuses.includes(status.toUpperCase()) ? status.toUpperCase() : "DRAFT";

    // Store local image paths
    const imageUrls = imageFiles ? imageFiles.map((file) => ({
      src: `/uploads/${file.filename}`,
    })) : [];

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        bodyHtml: body_html,
        vendor,
        productType: product_type,
        categoryId: categoryId ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
        variants: {
          create: variants.map((variant) => ({
            title: variant.title,
            price: parseFloat(variant.price),
            discount: variant.discount === "true" || variant.discount === true,
            discountPrice: variant.discount_price ? parseFloat(variant.discount_price) : null,
            sku: variant.sku,
            cost: variant.cost ? parseFloat(variant.cost) : null,
            quantity: variant.quantity ? parseInt(variant.quantity) : null,
          })),
        },
        tags: Array.isArray(tags) ? JSON.stringify(tags) : "[]",
        isFeatured: isFeatured === "true" || isFeatured === true,
        status: productStatus, // Added status field
        images: {
          create: imageUrls,
        },
      },
      include: { variants: true, images: true, category: true, subCategory: true },
    });

    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
};

// 🟢 Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        images: true,
        category: true,
        subCategory: true,
      },
    });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
};

// 🟢 Get Product by ID
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }, // Fixed typo: MOTION -> id
      include: {
        variants: true,
        images: true,
        category: true,
        subCategory: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product", details: error.message });
  }
};

// 🟢 Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      body_html,
      vendor,
      product_type,
      categoryId,
      subCategoryId,
      variants,
      tags,
      isFeatured,
      status, // Added status
    } = req.body;

    // Validate required fields
    if (!id || !title || !body_html || !vendor || !product_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Validate variants if provided
    if (variants && (!Array.isArray(variants) || variants.length === 0)) {
      return res.status(400).json({ error: "Variants must be a non-empty array" });
    }

    // Validate categoryId if provided
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!categoryExists) {
        return res.status(400).json({ error: "Invalid categoryId: Category not термfound" });
      }
    }

    // Validate subCategoryId if provided
    if (subCategoryId) {
      const subCategoryExists = await prisma.subCategory.findUnique({
        where: { id: parseInt(subCategoryId) },
      });
      if (!subCategoryExists) {
        return res.status(400).json({ error: "Invalid subCategoryId: SubCategory not found" });
      }
    }

    // Validate status if provided
    const validStatuses = ["ACTIVE", "DRAFT"];
    const productStatus = status && validStatuses.includes(status.toUpperCase()) ? status.toUpperCase() : existingProduct.status;

    // Store local image paths (only if images are uploaded)
    const imageFiles = req.files;
    const imageUrls = imageFiles ? imageFiles.map((file) => ({
      src: `/uploads/${file.filename}`,
    })) : [];

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title,
        bodyHtml: body_html,
        vendor,
        productType: product_type,
        categoryId: categoryId ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : "[]",
        isFeatured: isFeatured === "true" || isFeatured === true,
        status: productStatus, // Added status field
        images: imageUrls.length ? { create: imageUrls } : undefined,
        ...(variants && {
          variants: {
            deleteMany: {}, // Delete existing variants
            create: variants.map((variant) => ({
              title: variant.title,
              price: parseFloat(variant.price),
              discount: variant.discount === "true" || variant.discount === true,
              discountPrice: variant.discount_price ? parseFloat(variant.discount_price) : null,
              sku: variant.sku,
              cost: variant.cost ? parseFloat(variant.cost) : null,
              quantity: variant.quantity ? parseInt(variant.quantity) : null,
            })),
          },
        }),
      },
      include: {
        variants: true,
        images: true,
        category: true,
        subCategory: true,
      },
    });

    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
};

// 🟢 Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product", details: error.message });
  }
};