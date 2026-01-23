/// <reference types="astro/client" />

import type { auth } from "./lib/auth";

type Session = typeof auth.$Infer.Session.session;
type User = typeof auth.$Infer.Session.user;

declare namespace App {
  interface Locals {
    session: Session | null;
    user: User | null;
  }
}
