'use client'

import { useEffect, useState } from "react";
import { getFish, getFishTypes, Fish } from "@/src/api";
import { SideMenu } from "../sideMenu/sideMenu";
import { FishGrid } from "../fishGrid/fishGrid";

export function FishBrowser() {
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
    <div className="flex">
      <SideMenu
        types={types}
        selectedType={selectedType}
        onSelect={setSelectedType}
      />
      <main className="flex-1 p-6">
        <FishGrid fish={filtered} />
      </main>
    </div>
  );
}