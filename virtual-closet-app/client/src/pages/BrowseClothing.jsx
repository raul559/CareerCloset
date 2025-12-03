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
const COLORS = ["Black", "Brown", "Green", "White", "Gray", "Tan", "Navy"];

const ITEMS_PER_PAGE = 50;

export default function BrowseClothing() {
  const navigate = useNavigate();
  const { addToOutfit } = useOutfit();

  // Clothing metadata + image URLS
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("All Items");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const userId = "virtual-closet-user";

  // Load clothing metadata (now includes signed URLs from backend)
  useEffect(() => {
    async function loadItems() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        const res = await fetch(
          `${API_URL}/clothing?userId=${userId}`
        );
        const data = await res.json();

        if (data && data.items) {
          // Items already have thumbnailWebpUrl from backend
          setItems(data.items);
        } else {
          console.error("Unexpected API response:", data);
        }
      } catch (err) {
        console.error("Failed to load clothing:", err);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);



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

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  if (loading) return <p>Loading...</p>;

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
              <ItemCard key={it._id} item={it} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div style={{ marginTop: 30, textAlign: "center" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>

            <span style={{ margin: "0 15px" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
