// Forced reload at 2026-01-25T18:58:00
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Pool as MariaPool } from "mariadb";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Parse connection string and create pool with proper configuration
const parseConnectionString = (url: string) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
    connectionLimit: parseInt(parsed.searchParams.get('connection_limit') || '10'),
    connectTimeout: parseInt(parsed.searchParams.get('connect_timeout') || '30000'),
    poolTimeout: parseInt(parsed.searchParams.get('pool_timeout') || '30000'),
  };
};

const poolConfig = parseConnectionString(connectionString);

// Create MariaDB pool with proper settings
const pool = new MariaPool({
  host: poolConfig.host,
  port: poolConfig.port,
  user: poolConfig.user,
  password: poolConfig.password,
  database: poolConfig.database,
  connectionLimit: poolConfig.connectionLimit,
  connectTimeout: poolConfig.connectTimeout,
  acquireTimeout: poolConfig.poolTimeout,
  idleTimeout: 60000,
  minimumIdle: 1,
});

// Create MySQL/MariaDB adapter with pool
const adapter = new PrismaMariaDb(pool);

// Singleton pattern to prevent multiple PrismaClient instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
