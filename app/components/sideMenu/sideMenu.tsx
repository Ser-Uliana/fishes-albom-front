'use client'

import { useEffect, useState } from 'react'

type Props = {
  types: { id: number; name: string }[];
  selectedType: number | null;
  onSelect: (id: number | null) => void;
};

export function SideMenu({ types, selectedType, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const base =
    "block w-full rounded-xl px-4 py-3 text-left text-base font-medium transition-colors md:py-2 md:text-sm";
  const active = "bg-gray-900 text-white";
  const idle = "text-gray-600 hover:bg-gray-100 active:bg-gray-200";

  const currentName =
    selectedType === null
      ? "Усі"
      : types.find((t) => t.id === selectedType)?.name ?? "Усі";

  const handleSelect = (id: number | null) => {
    onSelect(id);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const list = (
    <ul className="space-y-1">
      <li>
        <button
          onClick={() => handleSelect(null)}
          className={`${base} ${selectedType === null ? active : idle}`}
        >
          Усі
        </button>
      </li>
      {types.map((t) => (
        <li key={t.id}>
          <button
            onClick={() => handleSelect(t.id)}
            className={`${base} ${selectedType === t.id ? active : idle}`}
          >
            {t.name}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Розпірки: резервують місце під fixed-меню */}
      <div className="h-14 shrink-0 md:hidden" aria-hidden="true" />
      <div className="hidden w-64 shrink-0 md:block" aria-hidden="true" />

      {/* Мобільна версія: фіксована верхня панель */}
      <div className="fixed inset-x-0 top-0 z-30 md:hidden">
        <div className="relative z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Відкрити меню категорій"
            className="flex h-14 w-full items-center justify-between px-4 text-left"
          >
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-gray-400">Категорія</span>
              <span className="text-base font-semibold text-gray-900">
                {currentName}
              </span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 text-gray-700 transition-transform ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10 bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              id="mobile-menu"
              className="absolute inset-x-0 top-full z-20 max-h-[70vh] overflow-y-auto rounded-b-2xl bg-white p-3 shadow-xl"
            >
              {list}
            </div>
          </>
        )}
      </div>

      {/* Десктоп: фіксована бокова панель */}
      <aside className="fixed inset-y-0 start-0 hidden w-64 overflow-y-auto border-e border-gray-100 bg-white p-4 md:block">
        {list}
      </aside>
    </>
  );
}