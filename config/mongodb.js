import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Ensure .env is loaded

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("DB CONNECTED SUCCESSFULLY");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Stop the app if DB fails
  }
};

export default connectDB;
