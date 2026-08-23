import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import prisma from "./config/prisma.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import casesRouter from "./routes/cases.js";
import tasksRouter from "./routes/tasks.js";
import calendarRouter from "./routes/calendar.js";
import notificationsRouter from "./routes/notifications.js";
import aiRouter from "./routes/ai.js";
import dashboardRouter from "./routes/dashboard.js";
import simulatorRouter from "./routes/simulator.js";
import { errorHandler } from "./middleware/errors.js";

const app = express();
const port = process.env.PORT || 4000;

// Security Middleware
app.use(helmet());

// CORS Configuration
const rawOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://localhost",
  "capacitor://localhost",
  "http://localhost",
];

const allowedOrigins = Array.from(new Set([...rawOrigins, ...defaultAllowedOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api", limiter);

// Body Parser
app.use(express.json());

// Base Routes
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LEXCONNECT Legal Ecosystem API is running.",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/db", async (req, res) => {
  try {
    // Execute a harmless database query
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "success",
      message: "Database connection is healthy.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed.",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/cases", casesRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/simulator", simulatorRouter);

// Centralized Error Handler
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
