import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create MySQL/MariaDB adapter with connection string
const adapter = new PrismaMariaDb(connectionString);

// Singleton pattern to prevent multiple PrismaClient instances
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

// Force clear cached client in development to ensure fresh instance with all models
if (process.env.NODE_ENV !== "production") {
  if (globalForPrisma.prisma) {
    // Always clear in development to pick up schema changes
    try {
      // Disconnect existing client before clearing
      if (globalForPrisma.prisma && typeof (globalForPrisma.prisma as any).$disconnect === 'function') {
        (globalForPrisma.prisma as any).$disconnect().catch(() => {});
      }
    } catch {
      // Ignore disconnect errors
    }
    delete (globalForPrisma as any).prisma;
  }
}

// Create fresh instance
const prisma = prismaClientSingleton();

// Verify Forum model exists
if (!('forum' in prisma)) {
  console.error('ERROR: Forum model not found in Prisma client. Please run: bunx prisma generate --config ./prisma.config.ts');
}

// In development, store on globalThis to prevent hot-reload from creating new instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;