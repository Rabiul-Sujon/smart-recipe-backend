import { Response } from "express";
import Groq from "groq-sdk";
import { toolDefinitions, searchRecipes } from "../ai/tools";
import { AuthRequest } from "../middleware/authMiddleware";
import Recipe from "../models/Recipe";

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const { message, history = [] } = req.body;

    let messages = [
      {
        role: "system",
        content:
          "You are a helpful recipe assistant for SmartRecipe. Use the searchRecipes tool when the user asks about ingredients, cuisines, or cook time. Keep answers short and friendly.",
      },
      ...history,
      { role: "user", content: message },
    ];

    let response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: toolDefinitions as any,
    });

    let reply = response.choices[0].message;

    // If the AI decided to call a tool
    if (reply.tool_calls && reply.tool_calls.length > 0) {
      messages.push(reply as any);

      for (const call of reply.tool_calls) {
        const args = JSON.parse(call.function.arguments);
        let result;

        if (call.function.name === "searchRecipes") {
          result = await searchRecipes(args);
        }

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        } as any);
      }

      // Ask AI again, now with real data
      response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
      });
      reply = response.choices[0].message;
    }

    res.json({
      reply: reply.content,
      history: [...messages, reply],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI chat failed", error });
  }
  
};

import Interaction from "../models/Interaction";

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Get user's interaction history
    const interactions = await Interaction.find({ userId: req.userId })
      .populate("recipeId", "title cuisine")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get all available recipes
    const allRecipes = await Recipe.find().limit(20);

    const historyText =
      interactions.length > 0
        ? interactions.map((i) => `${i.action}: ${i.cuisine} recipe`).join(", ")
        : "No history yet";

    const recipeList = allRecipes
      .map((r) => `ID:${r._id} | ${r.title} | ${r.cuisine} | ${r.cookTime}min | Rating:${r.rating}`)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a recipe recommendation engine. Based on user behavior, recommend 3 recipes from the list. Return ONLY a JSON array of recipe IDs like: ["id1","id2","id3"]. No other text.`,
        },
        {
          role: "user",
          content: `User history: ${historyText}\n\nAvailable recipes:\n${recipeList}\n\nReturn 3 recommended recipe IDs as JSON array only.`,
        },
      ],
    });

    const content = response.choices[0].message.content || "[]";
    const cleanContent = content.replace(/```json|```/g, "").trim();
    const recommendedIds = JSON.parse(cleanContent);

    const recommended = await Recipe.find({ _id: { $in: recommendedIds } });

    res.json({ recommended });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Recommendation failed", error });
  }
};

export const logInteraction = async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId, cuisine, action } = req.body;
    await Interaction.create({ userId: req.userId, recipeId, cuisine, action });
    res.json({ message: "Interaction logged" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log interaction", error });
  }
};