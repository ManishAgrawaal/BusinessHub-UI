const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
}

export async function loginUser(
  request: LoginRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
}
