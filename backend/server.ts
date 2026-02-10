import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { getDatabase } from "./config/database.local";

import routes from "./routes/routes";
// import notificationController from "./Controllers/notificationController";

console.log("🚀 Starting iReporter backend server...");
console.log("📂 Current directory:", process.cwd());
console.log("🔧 Loading environment variables...");

dotenv.config();

console.log("✅ Environment variables loaded");
console.log("🌐 PORT:", process.env.PORT || 3001);
console.log("🗄️  Using SQLite database for local development");

// Initialize SQLite database
const db = getDatabase();
console.log("✅ Connected to SQLite database");

const app = express();
const PORT = process.env.PORT || 3001;

console.log("🔧 Setting up middleware...");

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:5173", "https://josh-ireporter.vercel.app", "https://ireporter-frontend123.onrender.com"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("🛣️  Setting up basic routes...");

// Basic test route without loading complex routes
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Test SQLite database connection
    const db = getDatabase();
    const result = db.prepare("SELECT 1 as test").get();
    const dbStatus = "Connected to SQLite database";

    res.status(200).json({
      status: 200,
      data: [
        {
          message: "iReporter API is running successfully",
          database: dbStatus,
          timestamp: new Date().toISOString()
        }
      ],
    });
  } catch (dbError) {
    console.error("Database connection error:", dbError);
    res.status(200).json({
      status: 200,
      data: [
        {
          message: "iReporter API is running successfully",
          database: "Database connection failed",
          error: dbError instanceof Error ? dbError.message : String(dbError),
          timestamp: new Date().toISOString()
        }
      ],
    });
  }
});

app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    data: [{ message: "Test endpoint working" }],
  });
});

// Load routes
try {
  app.use("/api/v1", routes);
  console.log("✅ Routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading routes:", error);
  // Don't exit, just log the error
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    status: 500,
    error: "Something went wrong!",
  });
});

console.log(`🚀 Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, () => {
  console.log(`✅ iReporter server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log("🎉 Server startup complete!");
