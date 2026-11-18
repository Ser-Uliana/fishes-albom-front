'use client'

import { useState } from 'react'

type Props = {
  types: { id: number; name: string }[];
  selectedType: number | null;
  onSelect: (id: number | null) => void;
};

export function SideMenu({ types, selectedType, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const base = "block w-full rounded-lg px-4 py-2 text-left text-sm font-medium";
  const active = "bg-gray-100 text-gray-900";
  const idle = "text-gray-500 hover:bg-gray-50";

  const currentName =
    selectedType === null
      ? "Усі"
      : types.find((t) => t.id === selectedType)?.name ?? "Усі";

  const handleSelect = (id: number | null) => {
    onSelect(id);
    setOpen(false); // закриваємо випадайку після вибору
  };

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
      {/* Мобільна версія: бургер + випадайка */}
      <div className="relative border-b border-gray-100 bg-white md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Відкрити меню категорій"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-900"
        >
          <span>{currentName}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {open && (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-20 max-h-[70vh] overflow-y-auto border-b border-gray-100 bg-white p-4 shadow-lg"
          >
            {list}
          </div>
        )}
      </div>

      {/* Десктопна версія: бокове меню */}
      <div className="hidden h-screen w-64 flex-col border-e border-gray-100 bg-white md:flex">
        <div className="p-4">
          <div className="mt-4">{list}</div>
        </div>
      </div>
    </>
  );
}