import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI as string;
    if (!uri) throw new Error("MONGO_URI not found in .env");

    await mongoose.connect(uri, { family: 4 });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;