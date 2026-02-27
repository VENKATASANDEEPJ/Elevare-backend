const API_URL = "http://localhost:5000/api/users/";

export interface UserProfile {
  _id: string;
  email: string;
  streak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function getMe(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch profile");
  }

  return data as UserProfile;
}
