/// <reference types="astro/client" />

import type { AuthSession, AuthUser } from "./types/auth";

declare global {
  namespace App {
    interface Locals {
      /** Session data from Better Auth (may be stale) */
      session: AuthSession['session'] | null;
      /** User data from session (may be stale) */
      user: AuthSession['user'] | null;
      /** Fresh user data verified from database (always current) */
      verifiedUser: AuthUser | null;
    }
  }
}

