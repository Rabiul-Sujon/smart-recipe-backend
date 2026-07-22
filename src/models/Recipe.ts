import mongoose, { Schema, Document } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  description: string;
  image: string;
  ingredients: string[];
  steps: string[];
  cuisine: string;
  cookTime: number; // in minutes
  rating: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RecipeSchema = new Schema<IRecipe>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  ingredients: { type: [String], required: true },
  steps: { type: [String], required: true },
  cuisine: { type: String, required: true },
  cookTime: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRecipe>("Recipe", RecipeSchema);