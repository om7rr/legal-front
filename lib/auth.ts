"use client";

// Test-environment token storage. localStorage is convenient for the demo; a production app would use
// httpOnly cookies / a more XSS-resistant strategy.
const TOKEN_KEY = "lp_access_token";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY);
  },
};
