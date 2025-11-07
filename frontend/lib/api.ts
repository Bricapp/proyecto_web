const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type LoginPayload = {
  username: string;
  password: string;
};

export type TokenResponse = {
  access: string;
  refresh: string;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await safeParseError(response);
    throw new Error(detail ?? "No se pudo iniciar sesión");
  }

  return response.json() as Promise<TokenResponse>;
}

export async function fetchProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const detail = await safeParseError(response);
    throw new Error(detail ?? "No se pudo obtener el perfil");
  }

  return response.json() as Promise<UserProfile>;
}

async function safeParseError(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") {
      return data.detail;
    }
  } catch (error) {
    // Ignored: body might be empty or not JSON.
  }

  return null;
}
