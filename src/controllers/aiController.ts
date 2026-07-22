import { Response } from "express";
import Groq from "groq-sdk";
import { toolDefinitions, searchRecipes } from "../ai/tools";
import { AuthRequest } from "../middleware/authMiddleware";

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