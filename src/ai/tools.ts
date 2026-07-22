import Recipe from "../models/Recipe";

// Tool definitions the AI can choose to call
export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "searchRecipes",
      description: "Search recipes by ingredients, cuisine, or max cook time",
      parameters: {
        type: "object",
        properties: {
          ingredient: { type: "string", description: "An ingredient the user has, e.g. eggs" },
          cuisine: { type: "string", description: "Cuisine type, e.g. Italian, Indian" },
          maxCookTime: { type: "number", description: "Maximum cook time in minutes" },
        },
      },
    },
  },
];

// Actual function that runs when AI calls "searchRecipes"
export async function searchRecipes(args: {
  ingredient?: string;
  cuisine?: string;
  maxCookTime?: number;
}) {
  const query: any = {};

  if (args.ingredient) {
    query.ingredients = { $regex: args.ingredient, $options: "i" };
  }
  if (args.cuisine) {
    query.cuisine = { $regex: args.cuisine, $options: "i" };
  }
  if (args.maxCookTime) {
    query.cookTime = { $lte: args.maxCookTime };
  }

  const recipes = await Recipe.find(query).limit(5);
  return recipes.map((r) => ({
    title: r.title,
    cuisine: r.cuisine,
    cookTime: r.cookTime,
    ingredients: r.ingredients,
  }));
}