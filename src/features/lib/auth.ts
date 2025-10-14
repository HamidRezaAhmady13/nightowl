import { api, API_URL } from "./api";

// lib/auth.ts
export async function loginUser(email: string, password: string) {
  return api.post("/auth/signin", { email, password });
}

export async function logoutUser() {
  return api.post("/auth/logout", {}, { withCredentials: true });
}

export function redirectToGoogleAuth() {
  window.location.href = `${API_URL}/auth/google`;
}
