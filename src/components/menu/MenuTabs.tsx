"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import MenuGrid from "./MenuGrid";
import { MenuItem } from "../../lib/firestoreModels";

export default function MenuTabs() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tab, setTab] = useState<"classic" | "infused">("classic");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const res = await fetch("/api/menu");
        const data = await res.json();
        
        if (data.success) {
          setMenu(data.data || []);
        } else {
          console.error('Failed to fetch menu:', data.error);
          setMenu([]);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        setMenu([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const filtered = menu.filter(
    (item) =>
      item.type === tab &&
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "classic" | "infused")}
        >
          <TabsList>
            <TabsTrigger value="classic">Classic</TabsTrigger>
            <TabsTrigger value="infused">Infused</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {loading ? (
        <div className="text-center py-12 text-lg">Loading menu...</div>
      ) : (
        <MenuGrid items={filtered} />
      )}
    </div>
  );
}
