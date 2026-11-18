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

export type FishType ={
  id: number;
  name: string;
  color: string;
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
  const { name, image, description, isCaught, place, bait, date, weight, comments, idType } = data;

  const res = await fetch(`${API_URL}/fish/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name, image, description, isCaught, place, bait, date, weight, comments, idType,
    }),
  });

  if (!res.ok) throw new Error("Не вдалося оновити рибу");
  return res.json();
}

export async function getFishColorById(id: number) {
  const res = await fetch(`${API_URL}/fish-types/${id}/color`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Не вдалося завантажити колір риби (id: ${id}, статус: ${res.status})`
    );
  }
  return res.text();
}