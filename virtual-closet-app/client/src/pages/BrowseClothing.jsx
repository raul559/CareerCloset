import { useMemo, useState, useEffect } from "react";
import "../styles/browse.css";
import { useNavigate } from "react-router-dom";
import { useOutfit } from "../context/OutfitContext";

import {
  FiltersSidebar,
  ItemCard
} from "../components/BrowseClothingComponent";

// Categories should match the schema enum used on the server
const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Black", "Brown", "Green", "White", "Gray", "Tan", "Navy", "Blue", "Yellow", "Red", "Pink", "Purple", "Orange"];

const ITEMS_PER_PAGE = 30; // Reduced from 50 for faster initial load

export default function BrowseClothing() {
  const navigate = useNavigate();
  const { addToOutfit } = useOutfit();

  // Clothing metadata + image URLS
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("All Items");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // TODO: Replace hardcoded userId with authenticated user ID once user authentication is implemented
  // Remove from query params; backend will know user from auth token
  const userId = "virtual-closet-user";

  // Load ALL clothing items once (filtering happens client-side)
  useEffect(() => {
    // Load items function is defined here so it can be called on mount
    async function loadAllItems() {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

        // Fetch all items by making multiple paginated requests
        let allItems = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(
            `${API_URL}/clothing?userId=${userId}&page=${page}&limit=100&t=${Date.now()}`
          );
          const data = await res.json();

          if (data && data.items) {
            allItems = allItems.concat(data.items);
            hasMore = data.items.length === 100 && page < data.totalPages;
            page++;
          } else {
            hasMore = false;
          }
        }

        setItems(allItems);
        setTotal(allItems.length);
      } catch (err) {
        console.error("Failed to load clothing:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllItems();

    // Listen for cross-tab/page updates from admin actions
    const handler = () => {
      loadAllItems();
    };
    window.addEventListener('virtualcloset:itemsUpdated', handler);

    // Also listen for localStorage 'storage' events so other tabs/windows reload
    const storageHandler = (e) => {
      if (!e) return;
      if (e.key === 'virtualcloset:itemsUpdated') {
        loadAllItems();
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('virtualcloset:itemsUpdated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []); // Only load once on mount



  // Reset Filters
  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
    setAvailability("All Items");
    setQuery("");
  };

  // Toggle helpers
  const toggleSet = (setFn) => (value) =>
    setFn((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  const toggleCategory = toggleSet(setSelectedCategories);
  const toggleSize = toggleSet(setSelectedSizes);
  const toggleColor = toggleSet(setSelectedColors);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, availability, selectedCategories, selectedSizes, selectedColors]);

  // Filtering Logic
  const filtered = useMemo(() => {
    return items.filter((it) => {
      // Query search
      const q = query.trim().toLowerCase();
      const itemCategory = (it.category || it.subcategory || "").toLowerCase();
      const itemName = (it.name || "").toLowerCase();
      const itemColor = (it.color || "").toLowerCase();
      const itemSize = (it.size || "").toLowerCase();

      const matchesQuery =
        !q ||
        `${itemName} ${itemCategory} ${itemColor} ${itemSize}`.includes(q);

      // Availability
      const matchesAvail =
        availability === "All Items" ||
        (availability === "Available" && it.status !== "Unavailable") ||
        (availability === "Unavailable" && it.status === "Unavailable");

      // Category filter: compare against primary `category` field (schema enum)
      const matchesCategory = (() => {
        if (selectedCategories.size === 0) return true;
        const selected = Array.from(selectedCategories).map((c) => c.toLowerCase());
        const itemCat = (it.category || "").toLowerCase();
        const itemSub = (it.subcategory || "").toLowerCase();

        // Special rule: "Outerwear" filter should show only blazers
        if (selected.includes("outerwear")) {
          // Accept items whose subcategory is blazer (case-insensitive)
          const isBlazer = itemSub.includes("blazer") || itemName.includes("blazer");
          // If multiple categories are selected, still allow matches for other categories
          const otherSelected = selected.filter((c) => c !== "outerwear");
          const matchesOther = otherSelected.length === 0
            ? false
            : otherSelected.some((c) => c === itemCat);
          return isBlazer || matchesOther;
        }

        // Default: match item's primary category
        return selected.some((c) => c === itemCat);
      })();

      // Size filter: match if no filter OR item size matches
      const matchesSize =
        selectedSizes.size === 0 ||
        Array.from(selectedSizes).some(
          (size) => size.toLowerCase() === (it.size || "").toLowerCase()
        );

      // Color filter: match if no filter OR item color matches
      const matchesColor =
        selectedColors.size === 0 ||
        Array.from(selectedColors).some(
          (color) => color.toLowerCase() === (it.color || "").toLowerCase()
        );

      return (
        matchesQuery &&
        matchesAvail &&
        matchesCategory &&
        matchesSize &&
        matchesColor
      );
    });
  }, [query, availability, selectedCategories, selectedSizes, selectedColors, items]);

  // Client-side pagination after filtering all items
  const totalFilteredPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  if (loading) {
    return (
      <div className="loading-container">
        <svg className="mini-washer" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {/* Machine body */}
          <rect x="20" y="30" width="160" height="140" rx="8" fill="#e8e8e8" stroke="#2c5f7f" strokeWidth="2" />

          {/* Top control panel */}
          <rect x="20" y="30" width="160" height="35" rx="8" fill="#2c5f7f" />

          {/* Display screen */}
          <rect x="55" y="42" width="90" height="18" rx="3" fill="#1a3a52" />
          <text x="100" y="56" fontSize="14" fontWeight="bold" fill="#00ff88" textAnchor="middle">00:00</text>

          {/* Control knobs */}
          <circle cx="40" cy="80" r="8" fill="#3a7fa3" stroke="#2c5f7f" strokeWidth="1.5" />
          <line x1="40" y1="72" x2="40" y2="66" stroke="#2c5f7f" strokeWidth="1.5" />

          <circle cx="160" cy="80" r="8" fill="#3a7fa3" stroke="#2c5f7f" strokeWidth="1.5" />
          <line x1="160" y1="72" x2="160" y2="66" stroke="#2c5f7f" strokeWidth="1.5" />

          {/* Drum */}
          <circle cx="100" cy="115" r="50" fill="#e0f0ff" stroke="#2c5f7f" strokeWidth="1.5" />

          {/* Drum holes - animated */}
          <g className="drum-spin">
            <circle cx="85" cy="95" r="1.5" fill="#2c5f7f" opacity="0.6" />
            <circle cx="100" cy="85" r="1.5" fill="#2c5f7f" opacity="0.6" />
            <circle cx="115" cy="95" r="1.5" fill="#2c5f7f" opacity="0.6" />
            <circle cx="80" cy="115" r="1.5" fill="#2c5f7f" opacity="0.6" />
            <circle cx="120" cy="115" r="1.5" fill="#2c5f7f" opacity="0.6" />
            <circle cx="85" cy="135" r="1.5" fill="#2c5f7f" opacity="0.6" />
            <circle cx="100" cy="145" r="1.5" fill="#2c5f7f" opacity="0.6" />
            <circle cx="115" cy="135" r="1.5" fill="#2c5f7f" opacity="0.6" />
          </g>

          {/* Water in drum */}
          <g className="water-level">
            <ellipse cx="100" cy="125" rx="35" ry="12" fill="#5da3c7" opacity="0.5" />
          </g>

          {/* Door handle */}
          <circle cx="155" cy="115" r="7" fill="none" stroke="#2c5f7f" strokeWidth="1.5" />
        </svg>
        <p className="loading-text">Loading</p>
      </div>
    );
  }

  return (
    <main className="container">
      <div className="section-head">
        <h1>Browse Available Clothing</h1>
        <p className="section-sub">
          Explore our collection of professional attire. Items marked as unavailable
          are currently being used by other students.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <FiltersSidebar
          query={query}
          setQuery={setQuery}
          availability={availability}
          setAvailability={setAvailability}
          CATEGORIES={CATEGORIES}
          SIZES={SIZES}
          COLORS={COLORS}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          toggleCategory={toggleCategory}
          selectedSizes={selectedSizes}
          toggleSize={toggleSize}
          selectedColors={selectedColors}
          toggleColor={toggleColor}
          clearFilters={clearFilters}
          totalCount={items.length}
          filteredCount={filtered.length}
        />

        <section>
          <div className="browse-grid">
            {paginatedItems.map((it) => (
              <ItemCard
                key={it._id}
                item={it}
                onDelete={async (id) => {
                  try {
                    // call admin API to delete item and remove locally
                    const { deleteClothingItem } = await import("../services/adminApi");
                    const result = await deleteClothingItem(id);
                    console.log("Delete result:", result);
                    setItems((prev) => prev.filter((p) => p._id !== id));
                  } catch (err) {
                    console.error("Failed to delete item:", err);
                    console.error("Error response:", err.response?.data);
                    alert("Failed to delete item. See console for details.");
                  }
                }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <div style={{ marginTop: 30, textAlign: "center" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ marginRight: 10 }}
              >
                First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Previous
              </button>

              <span style={{ margin: "0 15px" }}>
                Page {currentPage} of {totalFilteredPages} ({filtered.length} items)
              </span>

              <button
                disabled={currentPage === totalFilteredPages}
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Next
              </button>

              <button
                disabled={currentPage === totalFilteredPages}
                onClick={() => {
                  setCurrentPage(totalFilteredPages);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ marginLeft: 10 }}
              >
                Last
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
