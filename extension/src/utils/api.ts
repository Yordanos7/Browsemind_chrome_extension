import type { AuthResponse, UserCredentials } from "../types";
import { setAuthToken } from "./storage"; // Import setAuthToken

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const register = async (
  credentials: UserCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Registration failed");
  }

  const authResponse: AuthResponse = await response.json();
  await setAuthToken(authResponse.token); // Store the token
  return authResponse;
};

export const getBrowsingData = async (token: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/activities/browsing-data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch browsing data");
  }

  return response.json();
};

export const login = async (
  credentials: UserCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Login failed");
  }

  const authResponse: AuthResponse = await response.json();
  await setAuthToken(authResponse.token); // Store the token after successful login
  return authResponse;
};
