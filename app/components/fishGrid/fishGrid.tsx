import { Fish } from "@/src/api";

function FishCard({ fish }: { fish: Fish }) {
  const date = fish.date
    ? new Date(fish.date).toLocaleDateString("uk-UA")
    : "—";

  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-green-800 px-3 py-1 text-xs font-semibold uppercase text-white">
          {fish.fishType.name}
        </span>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={fish.isCaught}
            readOnly
            className="h-5 w-5"
          />
          Піймали
        </label>
      </div>

      <h3 className="my-3 text-center text-2xl font-extrabold uppercase">
        {fish.name}
      </h3>

      {fish.image ? (
        <img
          src={fish.image}
          alt={fish.name}
          className="mx-auto h-40 w-full object-contain"
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          Немає фото
        </div>
      )}

      <p className="mt-3 text-sm text-gray-700">{fish.description}</p>

      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg border border-gray-300 px-2 py-1">
          <span className="text-gray-500">Місце:</span> {fish.place}
        </div>
        <div className="rounded-lg border border-gray-300 px-2 py-1">
          <span className="text-gray-500">Наживка:</span> {fish.bait}
        </div>
        <div className="rounded-lg border border-gray-300 px-2 py-1">
          <span className="text-gray-500">Дата:</span> {date}
        </div>
      </div>

      {fish.weight !== null && (
        <p className="mt-2 text-sm">
          <span className="text-gray-500">Вага:</span> {fish.weight} кг
        </p>
      )}

      <p className="mt-2 text-sm italic text-gray-600">
        <span className="not-italic text-gray-500">Мої коментарі:</span>{" "}
        {fish.comments}
      </p>
    </div>
  );
}

export function FishGrid({ fish }: { fish: Fish[] }) {
  if (fish.length === 0) {
    return <p className="text-gray-500">У цій категорії поки немає риб.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {fish.map((f) => (
        <FishCard key={f.id} fish={f} />
      ))}
    </div>
  );
}