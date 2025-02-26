import express from "express";
import upload from '../middlewares/upload.js';  // Import the upload middleware
import { addCategory, getCategories, getCategory, updateCategory, deleteCategory } from "../controllers/categories.controller.js";

const router = express.Router();

// Create a new category (with image upload)
router.post("/", upload.array("images", 5), addCategory);

// Get all categories
router.get("/", getCategories);

// Get a single category by ID
router.get("/:id", getCategory);

// Update category details
router.put("/:id", upload.array("images", 5), updateCategory);

// Delete a category
router.delete("/:id", deleteCategory);

export default router;
