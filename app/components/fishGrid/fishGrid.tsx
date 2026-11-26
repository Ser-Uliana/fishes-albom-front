'use client'

import { deleteFish, editFish, Fish, FishType, getFishColorById, getFishTypes, getToken } from "@/src/api";
import { useEffect, useRef, useState } from "react";

function fileToDataUrl(file: File, maxSize = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}

function FishCard({
  fish: initialFish,
  onDelete,
}: {
  fish: Fish;
  onDelete: (id: number) => void;
}) {
  const [fish, setFish] = useState<Fish>(initialFish);
  const [draft, setDraft] = useState<Fish>(initialFish);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [color, setColor] = useState("gray");
  const [types, setTypes] = useState<FishType[]>([]);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFishColorById(fish.idType).then(setColor).catch(() => {});
  }, [fish.idType]);

  const date = fish.date
    ? new Date(fish.date).toLocaleDateString("uk-UA")
    : "—";

  const startEdit = () => {
    setDraft(fish);
    setError("");
    setIsEditing(true);
    if (types.length === 0) {
      getFishTypes().then(setTypes).catch(() => setError("Не вдалося завантажити типи"));
    }
  };

  const changeType = (id: number) => {
    const t = types.find((x) => x.id === id);
    setDraft((d) => ({
      ...d,
      idType: id,
      fishType: (t ? { ...d.fishType, ...t } : d.fishType) as Fish["fishType"],
    }));
  };

  const cancelEdit = () => {
    setDraft(fish);
    setError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await editFish(fish.id, draft);
      setFish((prev) => ({
        ...prev,
        ...draft,
        ...updated,
        fishType: updated?.fishType ?? draft.fishType,
      }));
      setIsEditing(false);
    } catch {
      setError("Не вдалося зберегти зміни");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Видалити «${fish.name}»?`)) return;
    setSaving(true);
    setError("");
    try {
      await deleteFish(fish.id);
      onDelete(fish.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося видалити рибу");
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof Fish>(key: K, value: Fish[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Оберіть файл із зображенням");
      return;
    }
    try {
      setError("");
      set("image", (await fileToDataUrl(file)) as Fish["image"]);
    } catch {
      setError("Не вдалося прочитати фото");
    }
  };

  const shownImage = isEditing ? draft.image : fish.image;

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-base sm:px-2 sm:py-1 sm:text-sm";

  return (
    <div
      className="rounded-2xl border-2 bg-white p-4 shadow-sm"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between">
        {isEditing ? (
          <select
            value={draft.idType}
            onChange={(e) => changeType(Number(e.target.value))}
            className="rounded-full border border-gray-300 px-3 py-2 text-base font-semibold uppercase sm:py-1 sm:text-xs"
          >
            {types.length === 0 && (
              <option value={draft.idType}>{draft.fishType?.name}</option>
            )}
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase text-white"
            style={{ backgroundColor: color }}
          >
            {fish.fishType?.name}
          </span>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isEditing ? draft.isCaught : fish.isCaught}
            disabled={!isEditing}
            onChange={(e) => set("isCaught", e.target.checked)}
            className="h-6 w-6 sm:h-5 sm:w-5"
          />
          Піймали
        </label>
      </div>

      {isEditing ? (
        <input
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          className={`${inputClass} my-3 text-center text-xl font-bold uppercase`}
        />
      ) : (
        <h3 className="my-3 text-center text-2xl font-extrabold uppercase">
          {fish.name}
        </h3>
      )}

      {shownImage ? (
        <img
          src={shownImage}
          alt={fish.name}
          className="mx-auto h-48 w-full object-contain sm:h-40"
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400 sm:h-40">
          Немає фото
        </div>
      )}

      {isEditing && (
        <div className="mt-2 space-y-2">
          {/* Галерея */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {/* Камера (на телефоні відкриє камеру одразу) */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              🖼️ З галереї
            </button>
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              📷 Камера
            </button>
          </div>

          {draft.image && (
            <button
              type="button"
              onClick={() => set("image", null as Fish["image"])}
              className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
            >
              Видалити фото
            </button>
          )}

          <input
            value={draft.image?.startsWith("data:") ? "" : draft.image ?? ""}
            onChange={(e) => set("image", e.target.value as Fish["image"])}
            className={inputClass}
            placeholder="або встав посилання на фото"
          />
        </div>
      )}

      {isEditing ? (
        <textarea
          value={draft.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={`${inputClass} mt-3`}
          placeholder="Опис"
        />
      ) : (
        <p className="mt-3 text-sm text-gray-700">{fish.description}</p>
      )}

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        {isEditing ? (
          <>
            <label className="text-gray-500">
              Місце
              <input
                value={draft.place ?? ""}
                onChange={(e) => set("place", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-gray-500">
              Наживка
              <input
                value={draft.bait ?? ""}
                onChange={(e) => set("bait", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-gray-500">
              Дата
              <input
                type="date"
                value={draft.date ? String(draft.date).slice(0, 10) : ""}
                onChange={(e) => set("date", e.target.value as Fish["date"])}
                className={inputClass}
              />
            </label>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-gray-300 px-2 py-1">
              <span className="text-gray-500">Місце:</span> {fish.place}
            </div>
            <div className="rounded-lg border border-gray-300 px-2 py-1">
              <span className="text-gray-500">Наживка:</span> {fish.bait}
            </div>
            <div className="rounded-lg border border-gray-300 px-2 py-1">
              <span className="text-gray-500">Дата:</span> {date}
            </div>
          </>
        )}
      </div>

      {isEditing ? (
        <label className="mt-2 block text-sm text-gray-500">
          Вага (кг)
          <input
            type="number"
            step="0.01"
            value={draft.weight ?? ""}
            onChange={(e) =>
              set(
                "weight",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className={inputClass}
          />
        </label>
      ) : (
        fish.weight !== null && (
          <p className="mt-2 text-sm">
            <span className="text-gray-500">Вага:</span> {fish.weight} кг
          </p>
        )
      )}

      {isEditing ? (
        <label className="mt-2 block text-sm text-gray-500">
          Мої коментарі
          <textarea
            value={draft.comments ?? ""}
            onChange={(e) => set("comments", e.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>
      ) : (
        <p className="mt-2 text-sm italic text-gray-600">
          <span className="not-italic text-gray-500">Мої коментарі:</span>{" "}
          {fish.comments}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {isEditing ? (
          <>
            {/* Видалення: тільки в режимі редагування і тільки для залогіненого */}
            {getToken() && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-lg border border-red-300 px-4 py-3 text-base text-red-600 disabled:opacity-50 sm:mr-auto sm:py-1 sm:text-sm"
              >
                Видалити рибу
              </button>
            )}
            <button onClick={cancelEdit} disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-3 text-base sm:py-1 sm:text-sm">
              Скасувати
            </button>
            <button onClick={handleSave} disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-3 text-base text-white disabled:opacity-50 sm:py-1 sm:text-sm">
              {saving ? "Зачекайте…" : "Зберегти"}
            </button>
          </>
        ) : (
          <button onClick={startEdit}
            className="rounded-lg bg-gray-800 px-4 py-3 text-base text-white sm:py-1 sm:text-sm">
            Редагувати
          </button>
        )}
      </div>
    </div>
  );
}

export function FishGrid({ fish }: { fish: Fish[] }) {
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const visible = fish.filter((f) => !deletedIds.includes(f.id));

  if (visible.length === 0) {
    return <p className="text-gray-500">У цій категорії поки немає риб.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {visible.map((f) => (
        <FishCard
          key={f.id}
          fish={f}
          onDelete={(id) => setDeletedIds((ids) => [...ids, id])}
        />
      ))}
    </div>
  );
}