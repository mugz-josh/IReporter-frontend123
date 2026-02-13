import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import routes from "./routes/routes";
// import notificationController from "./Controllers/notificationController";

console.log("🚀 Starting iReporter backend server...");
console.log("📂 Current directory:", process.cwd());
console.log("🔧 Loading environment variables...");

dotenv.config();

console.log("✅ Environment variables loaded");
console.log("🌐 PORT:", process.env.PORT || 3001);

// Always use PostgreSQL database
let db: any;

const initializeDatabase = async () => {
  console.log("🗄️  Using PostgreSQL database");
  try {
    const dbModule = await import("./config/database");
    db = { query: dbModule.query };
    console.log("✅ Connected to PostgreSQL database");
    
    // Wait a bit to ensure tables are fully initialized
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test the connection
    try {
      const result = await db.query("SELECT 1 as test");
      console.log("✅ Database connection test successful");
    } catch (testError: any) {
      console.error("⚠️  Database connection test failed:", testError.message);
      // Don't throw - the health check will show the issue
    }
  } catch (err) {
    console.error("❌ Error importing PostgreSQL database:", err);
    throw err;
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

console.log("🔧 Setting up middleware...");

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:5173",
        "https://josh-ireporter.vercel.app",
        "https://ireporter-frontend123.onrender.com"
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // For development, allow all origins
        callback(null, true);
      }
    },
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
    let dbStatus = "";
    let dbError = null;

    try {
      // Test PostgreSQL database connection
      await db.query("SELECT 1 as test");
      dbStatus = "Connected to PostgreSQL database";
    } catch (pgError: any) {
      dbStatus = "PostgreSQL connection failed";
      dbError = pgError.message || String(pgError);
      console.error("PostgreSQL health check error:", pgError);
    }

    res.status(200).json({
      status: 200,
      data: [
        {
          message: "iReporter API is running successfully",
          database: dbStatus,
          error: dbError,
          timestamp: new Date().toISOString()
        }
      ],
    });
  } catch (generalError: any) {
    console.error("General health check error:", generalError);
    res.status(200).json({
      status: 200,
      data: [
        {
          message: "iReporter API is running successfully",
          database: "Database connection failed",
          error: generalError.message || String(generalError),
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

// Initialize database before starting server
initializeDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`✅ iReporter server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  }).on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}).catch((err) => {
  console.error('❌ Failed to initialize database:', err);
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
