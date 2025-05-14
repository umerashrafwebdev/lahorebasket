import express from "express";
import upload from '../middlewares/upload.js';  // Import the upload middleware
import { addSubCategory, getSubCategories, getSubCategory, updateSubCategory, deleteSubCategory } from "../controllers/subcategoryController.js";

const router = express.Router();

// Create a new subcategory (with image upload)
router.post("/", upload.array("images", 5), addSubCategory);

// Get all subcategories
router.get("/", getSubCategories);

// Get a single subcategory by ID
router.get("/:id", getSubCategory);

// Update subcategory details
router.put("/:id", upload.array("images", 5), updateSubCategory);

// Delete a subcategory
router.delete("/:id", deleteSubCategory);

export default router;