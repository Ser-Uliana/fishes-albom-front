'use client'

import { useEffect, useState } from "react";
import { getFish, getFishTypes, Fish } from "@/src/api";
import { SideMenu } from "../components/sideMenu/sideMenu";
import { FishGrid } from "../components/fishGrid/fishGrid";
import CreateFishModal from "../components/createFishModal/createFishModal";

export default function FishBrowserPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadFish = () => getFish().then(setFish).catch(console.error);

  useEffect(() => {
    getFishTypes().then(setTypes).catch(console.error);
    loadFish();
  }, []);

  const filtered =
    selectedType === null ? fish : fish.filter((f) => f.idType === selectedType);

  return (
    <div className="flex flex-col md:flex-row">
      <SideMenu
        types={types}
        selectedType={selectedType}
        onSelect={setSelectedType}
      />

      <main className="min-w-0 flex-1 p-4">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white"
          >
            Додати рибу
          </button>
        </div>

        <FishGrid fish={filtered} />
      </main>

      <CreateFishModal
        open={isOpen}
        fishTypes={types}
        onClose={() => setIsOpen(false)}
        onCreated={loadFish}
      />
    </div>
  );
}