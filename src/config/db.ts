import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

// Prisma 7 driver adapter for PostgreSQL
const adapter = new PrismaPg({ connectionString });

// Instantiate Prisma 7 Client with adapter
export const prisma = new PrismaClient({ adapter });

// Re-export Prisma types for convenient imports throughout the app
export * from "@prisma/client";
