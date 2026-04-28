import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin.js";
import playersRoutes from "./routes/players.js";
import matchesRoutes from "./routes/matches.js";
import publicRoutes from "./routes/public.js";
import seasonsRoutes from "./routes/seasons.js";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);
app.use("/api/seasons", seasonsRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/matches", matchesRoutes);
app.use(publicRoutes);
app.use("/seasons", seasonsRoutes);
app.use("/players", playersRoutes);
app.use("/matches", matchesRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API běží...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server runs on port ${PORT}`));
