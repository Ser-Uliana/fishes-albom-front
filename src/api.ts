const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getFish(): Promise<Fish[]> {
  const res = await fetch(`${API_URL}/fish`);
  if (!res.ok) throw new Error("Не вдалося завантажити риб");
  return res.json();
}

export type Fish = {
  id: number;
  idType: number;
  name: string;
  description: string;
  image: string | null;
  isCaught: boolean;
  bait: string;
  place: string;
  date: string;
  comments: string;
  weight: number | null;
  fishType: { id: number; name: string };
};

export type FishType = {
  id: number;
  name: string;
  color: string;
};

export type User = {
  id: number;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
};

type FishCreate = Pick<Fish, "name" | "image" | "idType"> &
  Partial<Omit<Fish, "id" | "fishType" | "name" | "image" | "idType">>;

export type LoginResult =
  | { accessToken: string; requires2FA?: undefined }
  | { requires2FA: true; tempToken: string; accessToken?: undefined };

const TOKEN_KEY = "accessToken";

export const getToken = (): string | null =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok)
    throw new Error(await readError(res, "Невірний email або пароль"));

  const data: LoginResult = await res.json();
  if (data.accessToken) setToken(data.accessToken);
  return data;
}

export const logout = () => localStorage.removeItem(TOKEN_KEY);

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body.message === "string" ? body.message : fallback;
  } catch {
    return fallback;
  }
}

async function authFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) logout();
  return res;
}

export async function verify2FA(tempToken: string, code: string) {
  const res = await fetch(`${API_URL}/auth/2fa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempToken, code }),
  });
  if (!res.ok) throw new Error(await readError(res, "Невірний код"));

  const data: { accessToken: string } = await res.json();
  setToken(data.accessToken);
  return data;
}

export async function setup2FA(): Promise<{ qr: string }> {
  const res = await authFetch("/auth/2fa/setup", { method: "POST" });
  if (!res.ok)
    throw new Error(await readError(res, "Не вдалося налаштувати 2FA"));
  return res.json();
}

export async function enable2FA(code: string) {
  const res = await authFetch("/auth/2fa/enable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await readError(res, "Невірний код"));
  return res.json() as Promise<{ enabled: boolean }>;
}

export async function getFishById(id: number) {
  const res = await fetch(`${API_URL}/fish/${id}`);
  if (!res.ok) throw new Error("Рибу не знайдено");
  return res.json();
}

export async function getFishTypes() {
  const res = await fetch(`${API_URL}/fish-types`);
  if (!res.ok) throw new Error("Не вдалося завантажити типи");
  return res.json();
}

export async function editFish(id: number, data: Fish) {
  const {
    name,
    image,
    description,
    isCaught,
    place,
    bait,
    date,
    weight,
    comments,
    idType,
  } = data;

  const res = await authFetch(`/fish/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      image,
      description,
      isCaught,
      place,
      bait,
      date,
      weight,
      comments,
      idType,
    }),
  });

  if (!res.ok) throw new Error(await readError(res, "Не вдалося оновити рибу"));
  return res.json();
}

export async function getFishColorById(id: number) {
  const res = await fetch(`${API_URL}/fish-types/${id}/color`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Не вдалося завантажити колір риби (id: ${id}, статус: ${res.status})`,
    );
  }
  return res.text();
}

export async function addFish(data: FishCreate) {
  const res = await authFetch(`/fish`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await readError(res, "Не вдалося додати рибу"));
  return res.json();
}

export async function deleteFish(id: number) {
  const res = await authFetch(`/fish/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await readError(res, "Не вдалося видалити рибу"));
}
