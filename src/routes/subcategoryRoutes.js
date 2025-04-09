// subcategoryRoutes.js
import express from "express";
import {
  addSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subcategoryController.js";

const router = express.Router();

// CRUD Routes for SubCategory
router.post("/", addSubCategory);         // Create a new subcategory
router.get("/", getSubCategories);        // Get all subcategories
router.get("/:id", getSubCategory);       // Get a single subcategory by ID
router.put("/:id", updateSubCategory);    // Update a subcategory by ID
router.delete("/:id", deleteSubCategory); // Delete a subcategory by ID

export default router;