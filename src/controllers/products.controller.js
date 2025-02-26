import prisma from "../db/index.js";

// 🟢 Add a New Product
export const addProduct = async (req, res) => {
  try {
    const { title, body_html, vendor, product_type, categoryId, variants, tags, isFeatured } = req.body;
    const imageFiles = req.files; // Uploaded images

    // Ensure required fields are provided
    if (!title || !vendor || !product_type) {
      return res.status(400).json({ error: "Title, vendor, and product type are required" });
    }

    // Store local image paths
    const imageUrls = imageFiles ? imageFiles.map((file) => ({
      src: `/uploads/${file.filename}`, // Save relative path for images
    })) : [];

    // Create product
    const product = await prisma.product.create({
      data: {
          title,
          bodyHtml: body_html,
          vendor,
          productType: product_type,
          categoryId: categoryId ? parseInt(categoryId) : null,  // Ensure it's parsed properly
          variants: {
              create: variants.map((variant) => ({
                  title: variant.title,
                  price: parseFloat(variant.price),  // Ensure proper number conversion
                  discount: variant.discount === 'true' || variant.discount === true,  // Ensure boolean
                  discountPrice: variant.discount_price ? parseFloat(variant.discount_price) : null,
                  sku: variant.sku,
              })),
          },
          tags: Array.isArray(tags) ? JSON.stringify(tags) : "[]",  // Ensure valid JSON
          isFeatured: isFeatured === 'true' || isFeatured === true,  // Ensure boolean conversion
          images: {
              create: imageUrls,
          },
      },
      include: { variants: true, images: true },
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
      include: { variants: true, images: true },
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
      where: { id: parseInt(id) },
      include: { variants: true, images: true },
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

    // Extract and validate body data
    const {
      title,
      body_html,
      vendor,
      product_type,
      categoryId,
      variants,
      tags,
      isFeatured,
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

    // Store local image paths (only if images are uploaded)
    const imageFiles = req.files;
    const imageUrls = imageFiles ? imageFiles.map((file) => ({
      src: `/uploads/${file.filename}`, // Save relative path for images
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
        tags: Array.isArray(tags) ? JSON.stringify(tags) : "[]",
        isFeatured: isFeatured === 'true',
        images: imageUrls.length ? { create: imageUrls } : undefined,
        variants: {
          deleteMany: {}, // Delete existing variants before creating new ones
          create: variants.map((variant) => ({
            title: variant.title,
            price: parseFloat(variant.price),
            discount: variant.discount === 'true',
            discountPrice: variant.discount_price ? parseFloat(variant.discount_price) : null,
            sku: variant.sku,
          })),
        },
      },
      include: { variants: true, images: true },
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

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product", details: error.message });
  }
};
