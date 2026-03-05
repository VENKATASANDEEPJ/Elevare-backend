import { apiRequest } from "./apiClient";

export interface UserProfile {
  _id: string;
  email: string;
  streak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayload {
  token: string;
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/users/register", {
    method: "POST",
    requiresAuth: false,
    body: JSON.stringify({ email, password, name }),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/users/login", {
    method: "POST",
    requiresAuth: false,
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token?: string): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/me", {
    method: "GET",
    token,
  });
}
