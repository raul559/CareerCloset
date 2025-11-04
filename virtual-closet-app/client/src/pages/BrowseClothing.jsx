import React, { useMemo, useState } from "react";
import "../styles/browse.css";
import{useNavigate} from "react-router-dom";
import { useOutfit } from "../context/OutfitContext";

import { FiltersSidebar, ItemCard } from "../components/BrowseClothingComponent";


/** Demo data */
const CATEGORIES = ["Blazers", "Shirts", "Pants", "Skirts", "Shoes", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Black", "Brown", "Green", "White", "Gray", "Tan", "Navy"];

const ITEMS = Array.from({ length: 48 }, (_, i) => {
  const id = 1001 + i;
  const size = SIZES[i % SIZES.length];
  const status = i % 7 === 2 ? "Unavailable" : "Available";
  const namePool = ["Black Blazer", "Leather Bag", "Green Blazer", "White Shirt", "Dress Pants", "Oxfords"];
  const category = CATEGORIES[i % CATEGORIES.length];
  const color = COLORS[i % COLORS.length];
  return {
    id,
    name: namePool[i % namePool.length],
    category,
    color,
    size,
    img: `https://picsum.photos/seed/closet${i + 1}/1200/900`,
    status,
  };
});

export default function BrowseClothing() {
    const navigate =useNavigate();
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("All Items");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());

  const toggleSet = (setFn) => (value) =>
    setFn((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  const toggleCategory = toggleSet(setSelectedCategories);
  const toggleSize = toggleSet(setSelectedSizes);
  const toggleColor = toggleSet(setSelectedColors);

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
    setAvailability("All Items");
    setQuery("");
  };

  const filtered = useMemo(() => {
    return ITEMS.filter((it) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || `${it.name} ${it.category} ${it.color} ${it.size}`.toLowerCase().includes(q);

      const matchesAvail =
        availability === "All Items" ||
        (availability === "Available" && it.status === "Available") ||
        (availability === "Unavailable" && it.status === "Unavailable");

      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(it.category);
      const matchesSize = selectedSizes.size === 0 || selectedSizes.has(it.size);
      const matchesColor = selectedColors.size === 0 || selectedColors.has(it.color);

      return matchesQuery && matchesAvail && matchesCategory && matchesSize && matchesColor;
    });
  }, [query, availability, selectedCategories, selectedSizes, selectedColors]);

  const year = new Date().getFullYear();

  return (
    <>
    
      <main className="container">
        <div className="section-head">
          <h1>Browse Available Clothing</h1>
          <p className="section-sub">
            Explore our collection of professional attire. Items marked as unavailable are currently being used by other
            students.
          </p>
        </div>

        {/* Layout: sidebar + results */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>
          <FiltersSidebar
            query={query} setQuery={setQuery}
            availability={availability} setAvailability={setAvailability}
            CATEGORIES={CATEGORIES} SIZES={SIZES} COLORS={COLORS}
            selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
            selectedSizes={selectedSizes} toggleSize={toggleSize}
            selectedColors={selectedColors} toggleColor={toggleColor}
            clearFilters={clearFilters}
            totalCount={ITEMS.length} filteredCount={filtered.length}
          />

          {/* Results */}
          <section>
            <div className="browse-grid">
              {filtered.map((it) => <ItemCard key={it.id} item={it} />)}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}