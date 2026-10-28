import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/db.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log("==================================================================");
  console.log(`🚀 Express server running on: http://localhost:${PORT}`);
  console.log(`📦 Product CRUD endpoint:     http://localhost:${PORT}/api/products`);
  console.log("==================================================================");

  // Optional: Verify Prisma database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ PostgreSQL connected successfully with Prisma 7!");
  } catch (err: any) {
    console.warn("⚠️ Database connection note:", err.message);
    console.warn("Please verify your DATABASE_URL in .env");
  }
});

// Graceful Shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected. Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
