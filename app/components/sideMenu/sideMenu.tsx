'use client'

type Props = {
  types: { id: number; name: string }[];
  selectedType: number | null;
  onSelect: (id: number | null) => void;
};

export function SideMenu({ types, selectedType, onSelect }: Props) {
  const base = "block w-full rounded-lg px-4 py-2 text-left text-sm font-medium";

  return (
    <div className="flex h-screen w-64 flex-col border-e border-gray-100 bg-white">
      <div className="p-4">
        <ul className="mt-4 space-y-1">
          <li>
            <button
              onClick={() => onSelect(null)}
              className={`${base} ${selectedType === null ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Усі
            </button>
          </li>
          {types.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => onSelect(t.id)}
                className={`${base} ${selectedType === t.id ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}