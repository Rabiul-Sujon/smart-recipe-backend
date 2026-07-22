import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./models/Recipe";
import User from "./models/User";

dotenv.config();

const recipes = [
  {
    title: "Classic Margherita Pizza",
    description: "A simple, authentic Italian pizza with fresh mozzarella, basil, and tomato sauce.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800",
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Basil leaves", "Olive oil", "Salt"],
    steps: [
      "Preheat oven to 250°C with a pizza stone if available.",
      "Roll out the pizza dough into a thin circle.",
      "Spread a thin layer of tomato sauce over the dough.",
      "Tear mozzarella into pieces and distribute evenly.",
      "Bake for 8-10 minutes until crust is golden and cheese bubbles.",
      "Top with fresh basil and a drizzle of olive oil before serving.",
    ],
    cuisine: "Italian",
    cookTime: 25,
    rating: 4.7,
  },
  {
    title: "Butter Chicken",
    description: "Creamy, mildly spiced North Indian curry with tender chicken in a tomato-based sauce.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800",
    ingredients: ["Chicken thighs", "Yogurt", "Butter", "Tomato puree", "Cream", "Garam masala", "Ginger-garlic paste"],
    steps: [
      "Marinate chicken in yogurt, ginger-garlic paste, and spices for at least 1 hour.",
      "Grill or pan-sear the marinated chicken until charred and cooked through.",
      "In a pan, melt butter and sauté onions until golden.",
      "Add tomato puree and simmer for 10 minutes.",
      "Stir in cream and garam masala, then add the cooked chicken.",
      "Simmer for 5 more minutes and serve with naan or rice.",
    ],
    cuisine: "Indian",
    cookTime: 45,
    rating: 4.9,
  },
  {
    title: "Vegetable Fried Rice",
    description: "Quick and easy fried rice loaded with vegetables and soy sauce, ready in minutes.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800",
    ingredients: ["Cooked rice", "Eggs", "Carrots", "Peas", "Spring onion", "Soy sauce", "Garlic"],
    steps: [
      "Heat oil in a wok over high heat.",
      "Scramble the eggs and set aside.",
      "Sauté garlic, carrots, and peas for 2-3 minutes.",
      "Add cooked rice and stir-fry, breaking up clumps.",
      "Return eggs to the wok, add soy sauce, and toss well.",
      "Garnish with chopped spring onion and serve hot.",
    ],
    cuisine: "Asian",
    cookTime: 15,
    rating: 4.5,
  },
  {
    title: "Chocolate Lava Cake",
    description: "Rich, decadent chocolate cake with a warm, gooey molten center.",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800",
    ingredients: ["Dark chocolate", "Butter", "Eggs", "Sugar", "Flour", "Vanilla extract"],
    steps: [
      "Preheat oven to 200°C and grease ramekins.",
      "Melt dark chocolate and butter together until smooth.",
      "Whisk eggs and sugar until pale, then fold into the chocolate mixture.",
      "Gently fold in flour and vanilla extract.",
      "Pour batter into ramekins and bake for 10-12 minutes.",
      "Let cool for 1 minute, then invert onto a plate and serve immediately.",
    ],
    cuisine: "Desserts",
    cookTime: 30,
    rating: 4.8,
  },
  {
    title: "Simple Scrambled Eggs",
    description: "Soft, creamy scrambled eggs ready in under 10 minutes — perfect quick breakfast.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800",
    ingredients: ["Eggs", "Butter", "Salt", "Black pepper", "Milk"],
    steps: [
      "Crack eggs into a bowl, add a splash of milk, salt, and pepper, and whisk well.",
      "Melt butter in a non-stick pan over low heat.",
      "Pour in eggs and stir continuously with a spatula.",
      "Remove from heat while still slightly runny, as they'll continue cooking.",
      "Serve immediately with toast.",
    ],
    cuisine: "American",
    cookTime: 8,
    rating: 4.3,
  },
  {
    title: "Egg Fried Rice with Vegetables",
    description: "A satisfying one-pan meal using eggs, rice, and whatever vegetables you have on hand.",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800",
    ingredients: ["Eggs", "Cooked rice", "Bell peppers", "Onion", "Soy sauce", "Garlic", "Sesame oil"],
    steps: [
      "Heat sesame oil in a large pan or wok.",
      "Scramble eggs lightly and remove from pan.",
      "Sauté garlic, onion, and bell peppers until softened.",
      "Add rice and stir-fry for 3-4 minutes.",
      "Mix in scrambled eggs and soy sauce, tossing everything together.",
      "Serve hot, garnished with extra spring onion if desired.",
    ],
    cuisine: "Asian",
    cookTime: 18,
    rating: 4.4,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, { family: 4 });
    console.log("Connected to MongoDB for seeding");

    const user = await User.findOne();
    if (!user) {
      console.log("No user found — register a user first via /api/auth/register");
      process.exit(1);
    }

    await Recipe.deleteMany({});

    const recipesWithOwner = recipes.map((r) => ({ ...r, createdBy: user._id }));
    await Recipe.insertMany(recipesWithOwner);

    console.log(`Seeded ${recipes.length} recipes successfully`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();