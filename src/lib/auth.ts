import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4321",
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable later
    minPasswordLength: 8,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    cookieCache: {
      enabled: false, // Disable cache to ensure fresh session checks
    },
  },

  // Explicit cookie configuration for Astro + Node adapter
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: false, // Set to true in production with HTTPS
    generateId: () => Math.random().toString(36).substring(2, 11), // Custom ID generator if needed
  },

  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
        input: true,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
    },
  },

  trustedOrigins: [
    "http://localhost:4321",
    "http://localhost:4322",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
