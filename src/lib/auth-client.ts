import { createAuthClient } from "better-auth/client";

// Create auth client with inferred types from server
export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include", // Ensure cookies are sent and received
  },
});

export const { signIn, signUp, signOut } = authClient;

// Type-safe sign up with username
export async function signUpWithUsername(data: {
  email: string;
  password: string;
  name: string;
  username: string;
}) {
  // Use raw fetch to call the signup endpoint with additional fields
  // Include credentials to receive and store cookies
  const response = await fetch('/api/auth/sign-up/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: this ensures cookies are set
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      name: data.name,
      username: data.username,
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    return { error: result };
  }
  
  return { data: result };
}
