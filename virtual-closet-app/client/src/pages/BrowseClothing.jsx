
import React, { useState } from "react";
import "../styles/browse.css";
import { useNavigate } from "react-router-dom";
import { useOutfit } from "../context/OutfitContext";
import { useClothingApi } from "../hooks/useClothingApi";
import { FiltersSidebar, ItemCard } from "../components/BrowseClothingComponent";



const CATEGORIES = ["Blazers", "Shirts", "Pants", "Skirts", "Shoes", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Black", "Brown", "Green", "White", "Gray", "Tan", "Navy"];

export default function BrowseClothing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("All Items");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { items: apiItems, loading: apiLoading, error: apiError, total, page: currentPage, limit: pageLimit } = useClothingApi({ page, limit });

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


  // Filter API items using the same logic as before
  const filtered = apiItems.filter((it) => {
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

  // Pagination controls
  const totalPages = Math.ceil((total || 0) / (pageLimit || 1));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <>
      <main className="container">
        <div className="section-head">
          <h1>Browse Available Clothing</h1>
          <p className="section-sub">
            Explore our collection of professional attire. Items marked as unavailable are currently being used by other students.
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
            totalCount={total} filteredCount={filtered.length}
          />

          {/* Results */}
          <section>
            {apiLoading && <p>Loading...</p>}
            {apiError && <p style={{ color: 'red' }}>Error loading items</p>}
            <div className="browse-grid">
              {filtered.map((it) => <ItemCard key={it.clothingId || it.id} item={it} />)}
            </div>
            {/* Pagination Controls */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button onClick={() => setPage(1)} disabled={page === 1}>First</button>
              <button onClick={() => setPage(page - 1)} disabled={!canPrev}>Prev</button>
              <span style={{ padding: '0 8px' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={!canNext}>Next</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
              <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} style={{ marginLeft: 16 }}>
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
              </select>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}