import express from "express";
import { chatWithAI, getRecommendations, logInteraction } from "../controllers/aiController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/chat", protect, chatWithAI);
router.get("/recommendations", protect, getRecommendations);
router.post("/interact", protect, logInteraction);

export default router;