import express from "express";
import upload from '../middlewares/upload.js';  // Import the upload middleware
import { addProduct, getProducts, getProduct, updateProduct, deleteProduct,getProductByVariantId } from "../controllers/products.controller.js";

const router = express.Router();

// Create a new product (with image upload)
router.post("/", upload.array("images", 5), addProduct);

// Get all products
router.get("/", getProducts);

// Get a single product by ID
router.get("/:id", getProduct);
router.get('/by-variant/:variantId', getProductByVariantId);
// Update product details
router.put("/:id", upload.array("images", 5), updateProduct);

// Delete a product
router.delete("/:id", deleteProduct);

export default router;
