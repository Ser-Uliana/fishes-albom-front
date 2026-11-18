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