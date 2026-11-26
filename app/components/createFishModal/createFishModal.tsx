"use client";

import { FormEvent, useEffect, useState } from "react";
import { addFish } from "@/src/api";

export type FishTypeOption = { id: number; name: string };

type Props = {
  open: boolean;
  fishTypes: FishTypeOption[];
  onClose: () => void;
  onCreated?: (fish: unknown) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CreateFishModal({
  open,
  fishTypes,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [idType, setIdType] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // закриття по Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  useEffect(() => {
  setDate(today());
}, []);

  const reset = () => {
    setName("");
    setIdType("");
    setDescription("");
    setImage("");
    setDate(today());
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || idType === "") {
      setError("Вкажи назву і тип риби");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await addFish({
        name: name.trim(),
        idType: idType as number,
        description: description.trim(),
        image: image.trim(),
        date,
        isCaught: false,
        place: "",
        bait: "",
        weight: 0,
        comments: "",
      });
      onCreated?.(created);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося створити рибу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-fish-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="create-fish-title" className="text-xl font-semibold">
            Нова риба
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="text-3xl leading-none text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Назва</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад, Короп"
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Тип</span>
            <select
              className={inputClass}
              value={idType}
              onChange={(e) =>
                setIdType(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Обери тип</option>
              {fishTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Опис</span>
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Де спіймав, на що, розмір..."
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Посилання на фото</span>
            <input
              className={inputClass}
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </label>

          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt="Попередній перегляд"
              className="max-h-44 w-full rounded-lg object-cover"
            />
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Дата</span>
            <input
              className={inputClass}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Створюю..." : "Створити"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}