import mongoose, { Schema, Document } from "mongoose";

export interface IInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  recipeId: mongoose.Types.ObjectId;
  cuisine: string;
  action: "view" | "add";
}

const InteractionSchema = new Schema<IInteraction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipeId: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    cuisine: { type: String, required: true },
    action: { type: String, enum: ["view", "add"], default: "view" },
  },
  { timestamps: true }
);

export default mongoose.model<IInteraction>("Interaction", InteractionSchema);