const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

export type TokenResponse = {
  access: string;
  refresh: string;
  user: UserProfile;
};

export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Partida = {
  id: number;
  nombre: string;
  tipo: "fijo" | "variable";
  monto_asignado: number;
  gastado_mes: number;
  disponible_mes: number;
  created_at: string;
  updated_at: string;
};

export type Gasto = {
  id: number;
  partida: number | null;
  partida_nombre: string | null;
  monto: number;
  fecha: string;
  tipo: "fijo" | "variable";
  categoria: string | null;
  observacion: string;
  created_at: string;
  updated_at: string;
};

export type Ingreso = {
  id: number;
  monto: number;
  fecha: string;
  tipo: "fijo" | "eventual";
  observacion: string;
  created_at: string;
  updated_at: string;
};

export type ResumenFinanciero = {
  total_ingresos: number;
  total_gastos: number;
  saldo: number;
  ahorro_porcentaje: number;
  gastos_por_categoria: Record<string, number>;
  partidas: Partida[];
  sugerencias: string[];
  ingresos_recientes: Ingreso[];
  gastos_recientes: Gasto[];
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

type PartidaResponse = Omit<Partida, "monto_asignado" | "gastado_mes" | "disponible_mes"> & {
  monto_asignado: string;
  gastado_mes: string;
  disponible_mes: string;
};

type GastoResponse = Omit<Gasto, "monto"> & { monto: string };

type IngresoResponse = Omit<Ingreso, "monto"> & { monto: string };

type ResumenResponse = Omit<ResumenFinanciero, "total_ingresos" | "total_gastos" | "saldo" | "ahorro_porcentaje" | "gastos_por_categoria" | "partidas" | "ingresos_recientes" | "gastos_recientes"> & {
  total_ingresos: string;
  total_gastos: string;
  saldo: string;
  ahorro_porcentaje: string;
  gastos_por_categoria: Record<string, string>;
  partidas: PartidaResponse[];
  ingresos_recientes: IngresoResponse[];
  gastos_recientes: GastoResponse[];
};

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  return request<TokenResponse>("/api/v1/auth/login/", { method: "POST", body: payload });
}

export async function register(payload: RegisterPayload): Promise<TokenResponse> {
  return request<TokenResponse>("/api/v1/auth/register/", { method: "POST", body: payload });
}

export async function fetchProfile(accessToken: string): Promise<UserProfile> {
  return request<UserProfile>("/api/v1/auth/me/", { token: accessToken });
}

export async function updateProfile(
  token: string,
  payload: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    photo?: File | null;
    remove_photo?: boolean;
  }
): Promise<UserProfile> {
  const formData = new FormData();
  if (payload.first_name !== undefined) {
    formData.append("first_name", payload.first_name);
  }
  if (payload.last_name !== undefined) {
    formData.append("last_name", payload.last_name);
  }
  if (payload.phone !== undefined) {
    formData.append("phone", payload.phone ?? "");
  }
  if (payload.photo instanceof File) {
    formData.append("photo", payload.photo);
  }
  if (payload.remove_photo) {
    formData.append("remove_photo", "true");
  }

  return request<UserProfile>("/api/v1/auth/me/", {
    method: "PATCH",
    body: formData,
    token
  });
}

export async function loginWithGoogle(idToken: string): Promise<TokenResponse> {
  return request<TokenResponse>("/api/v1/auth/login/google/", {
    method: "POST",
    body: { id_token: idToken }
  });
}

export async function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return request<{ detail: string }>("/api/v1/auth/password/reset/", {
    method: "POST",
    body: { email }
  });
}

export async function confirmPasswordReset(payload: {
  uid: string;
  token: string;
  password: string;
}): Promise<{ detail: string }> {
  return request<{ detail: string }>("/api/v1/auth/password/reset/confirm/", {
    method: "POST",
    body: payload
  });
}

export async function changePassword(
  accessToken: string,
  payload: { password_actual: string; password_nuevo: string }
): Promise<{ detail: string }> {
  return request<{ detail: string }>("/api/v1/auth/password/change/", {
    method: "POST",
    body: payload,
    token: accessToken
  });
}

export async function fetchPartidas(token: string): Promise<Partida[]> {
  const data = await request<PartidaResponse[]>("/api/v1/partidas/", { token });
  return data.map(mapPartida);
}

export async function createPartida(
  token: string,
  payload: { nombre: string; tipo: "fijo" | "variable"; monto_asignado: number }
): Promise<Partida> {
  const data = await request<PartidaResponse>("/api/v1/partidas/", {
    method: "POST",
    body: payload,
    token
  });
  return mapPartida(data);
}

export async function updatePartida(
  token: string,
  id: number,
  payload: { nombre: string; tipo: "fijo" | "variable"; monto_asignado: number }
): Promise<Partida> {
  const data = await request<PartidaResponse>(`/api/v1/partidas/${id}/`, {
    method: "PUT",
    body: payload,
    token
  });
  return mapPartida(data);
}

export async function deletePartida(token: string, id: number): Promise<void> {
  await request<void>(`/api/v1/partidas/${id}/`, { method: "DELETE", token });
}

export async function fetchGastos(token: string): Promise<Gasto[]> {
  const data = await request<GastoResponse[]>("/api/v1/gastos/", { token });
  return data.map(mapGasto);
}

export async function createGasto(
  token: string,
  payload: {
    partida?: number | null;
    monto: number;
    fecha: string;
    tipo: "fijo" | "variable";
    categoria?: string | null;
    observacion?: string | null;
  }
): Promise<Gasto> {
  const data = await request<GastoResponse>("/api/v1/gastos/", {
    method: "POST",
    body: payload,
    token
  });
  return mapGasto(data);
}

export async function updateGasto(
  token: string,
  id: number,
  payload: {
    partida?: number | null;
    monto: number;
    fecha: string;
    tipo: "fijo" | "variable";
    categoria?: string | null;
    observacion?: string | null;
  }
): Promise<Gasto> {
  const data = await request<GastoResponse>(`/api/v1/gastos/${id}/`, {
    method: "PUT",
    body: payload,
    token
  });
  return mapGasto(data);
}

export async function deleteGasto(token: string, id: number): Promise<void> {
  await request<void>(`/api/v1/gastos/${id}/`, { method: "DELETE", token });
}

export async function fetchIngresos(token: string): Promise<Ingreso[]> {
  const data = await request<IngresoResponse[]>("/api/v1/ingresos/", { token });
  return data.map(mapIngreso);
}

export async function createIngreso(
  token: string,
  payload: { monto: number; fecha: string; tipo: "fijo" | "eventual"; observacion?: string | null }
): Promise<Ingreso> {
  const data = await request<IngresoResponse>("/api/v1/ingresos/", {
    method: "POST",
    body: payload,
    token
  });
  return mapIngreso(data);
}

export async function updateIngreso(
  token: string,
  id: number,
  payload: { monto: number; fecha: string; tipo: "fijo" | "eventual"; observacion?: string | null }
): Promise<Ingreso> {
  const data = await request<IngresoResponse>(`/api/v1/ingresos/${id}/`, {
    method: "PUT",
    body: payload,
    token
  });
  return mapIngreso(data);
}

export async function deleteIngreso(token: string, id: number): Promise<void> {
  await request<void>(`/api/v1/ingresos/${id}/`, { method: "DELETE", token });
}

export async function fetchResumenFinanciero(token: string): Promise<ResumenFinanciero> {
  const data = await request<ResumenResponse>("/api/v1/resumen/", { token });
  return {
    total_ingresos: parseNumber(data.total_ingresos),
    total_gastos: parseNumber(data.total_gastos),
    saldo: parseNumber(data.saldo),
    ahorro_porcentaje: parseNumber(data.ahorro_porcentaje),
    gastos_por_categoria: Object.fromEntries(
      Object.entries(data.gastos_por_categoria).map(([key, value]) => [key, parseNumber(value)])
    ),
    partidas: data.partidas.map(mapPartida),
    sugerencias: data.sugerencias,
    ingresos_recientes: data.ingresos_recientes.map(mapIngreso),
    gastos_recientes: data.gastos_recientes.map(mapGasto)
  };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers: customHeaders } = options;
  const headers: Record<string, string> = { ...(customHeaders ?? {}) };

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: payload
  });

  if (!response.ok) {
    const detail = await safeParseError(response);
    const error = new Error(detail ?? "Ocurrió un error al comunicarse con el servidor");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function parseNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function mapPartida(data: PartidaResponse): Partida {
  return {
    ...data,
    monto_asignado: parseNumber(data.monto_asignado),
    gastado_mes: parseNumber(data.gastado_mes),
    disponible_mes: parseNumber(data.disponible_mes)
  };
}

function mapGasto(data: GastoResponse): Gasto {
  return {
    ...data,
    monto: parseNumber(data.monto),
    categoria: data.categoria ?? null,
    partida_nombre: data.partida_nombre ?? null
  };
}

function mapIngreso(data: IngresoResponse): Ingreso {
  return {
    ...data,
    monto: parseNumber(data.monto)
  };
}

async function safeParseError(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    if (typeof (data as { detail?: unknown }).detail === "string") {
      return data.detail as string;
    }
  } catch (error) {
    // ignored
  }
  return null;
}
