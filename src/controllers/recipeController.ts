import { Response } from "express";
import Recipe from "../models/Recipe";
import { AuthRequest } from "../middleware/authMiddleware";

// Create a recipe (protected)
export const createRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, image, ingredients, steps, cuisine, cookTime } = req.body;

    const recipe = await Recipe.create({
      title,
      description,
      image,
      ingredients,
      steps,
      cuisine,
      cookTime,
      createdBy: req.userId,
    });

    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Failed to create recipe", error });
  }
};

// Get all recipes (public) — with search, filter, sort, pagination
export const getRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const { search, cuisine, sort, page = "1", limit = "8" } = req.query;

    const query: any = {};
    if (search) query.title = { $regex: search as string, $options: "i" };
    if (cuisine) query.cuisine = cuisine;

    let sortOption: any = { createdAt: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "cookTime") sortOption = { cookTime: 1 };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const recipes = await Recipe.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Recipe.countDocuments(query);

    res.json({ recipes, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes", error });
  }
};

// Get single recipe (public)
export const getRecipeById = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("createdBy", "name");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipe", error });
  }
};

// Get logged-in user's recipes (protected)
export const getMyRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.userId });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your recipes", error });
  }
};

// Delete a recipe (protected, owner only)
export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete recipe", error });
  }
};