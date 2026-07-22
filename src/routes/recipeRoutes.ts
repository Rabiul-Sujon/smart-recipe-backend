import express from "express";
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  getMyRecipes,
  deleteRecipe,
} from "../controllers/recipeController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getRecipes);           // public - explore page
router.get("/mine", protect, getMyRecipes); // protected - manage page
router.get("/:id", getRecipeById);     // public - details page
router.post("/", protect, createRecipe); // protected - add page
router.delete("/:id", protect, deleteRecipe); // protected

export default router;