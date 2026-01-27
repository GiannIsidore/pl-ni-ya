// Forced reload at 2026-01-25T18:58:00
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create MySQL/MariaDB adapter with connection string
const adapter = new PrismaMariaDb(connectionString);

// Singleton pattern to prevent multiple PrismaClient instances
const prismaClientSingleton = () => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  
  const client = new PrismaClient({ adapter });

  // In development, store on globalThis to prevent hot-reload from creating new instances
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

// Use the singleton function to get the client
const prisma = prismaClientSingleton();

// Verify Forum model exists
if (!('forum' in prisma)) {
  console.error('ERROR: Forum model not found in Prisma client. Please run: bunx prisma generate --config ./prisma.config.ts');
}

export default prisma;