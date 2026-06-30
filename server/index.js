import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.js";
import issuesRouter from "./routes/issues.js";
import usersRouter from "./routes/users.js";
import insightsRouter from "./routes/insights.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/health", healthRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/users", usersRouter);
app.use("/api/insights", insightsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));