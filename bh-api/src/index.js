import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import playersRoutes from "./routes/players.js";
import matchesRoutes from "./routes/matches.js";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());

app.use("/api/players", playersRoutes);
app.use("/api/matches", matchesRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API běží...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server runs on port ${PORT}`));
