import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true, // use the new URL string parser
      useUnifiedTopology: true, // use the new Server Discover and Monitoring engine
    });
    console.log("Database connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("Error while connecting to database", error.message);
    process.exit(1); // Stop the app if DB connection fails
  }
};

export default dbConnection;
