'use client'

import { useEffect, useState } from "react";
import { getFish, getFishTypes, Fish } from "@/src/api";
import { SideMenu } from "../components/sideMenu/sideMenu";
import { FishGrid } from "../components/fishGrid/fishGrid";

export default function FishBrowserPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);

  useEffect(() => {
    getFishTypes().then(setTypes).catch(console.error);
    getFish().then(setFish).catch(console.error);
  }, []);

  const filtered = selectedType === null
    ? fish
    : fish.filter((f) => f.idType === selectedType);

  return (
    <div className="flex flex-col md:flex-row">
      <SideMenu
        types={types}
        selectedType={selectedType}
        onSelect={setSelectedType}
      />
      <main className="fmin-w-0 flex-1 p-4">
        <FishGrid fish={filtered} />
      </main>
    </div>
  );
}