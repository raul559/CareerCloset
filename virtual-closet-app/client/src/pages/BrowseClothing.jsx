import { useMemo, useState, useEffect } from "react";
import "../styles/browse.css";
import { useNavigate } from "react-router-dom";
import { useOutfit } from "../context/OutfitContext";

import {
  FiltersSidebar,
  ItemCard
} from "../components/BrowseClothingComponent";

const CATEGORIES = ["Blazers", "Shirts", "Pants", "Skirts", "Shoes", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Black", "Brown", "Green", "White", "Gray", "Tan", "Navy"];

const ITEMS_PER_PAGE = 50;

export default function BrowseClothing() {
  const navigate = useNavigate();
  const { addToOutfit } = useOutfit();

  // Clothing metadata + image URLS
  const [items, setItems] = useState([]);
  const [itemsWithUrls, setItemsWithUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("All Items");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const userId = "virtual-closet-user";

  // Load clothing metadata metadata from MongoDB
  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/clothing?userId=${userId}`
        );
        const data = await res.json();

        if (data && data.items) {
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

  // Replace filename with signed URLs
  useEffect(() => {
    async function loadSignedURls() {
      try {
        const updated = await Promise.all(
          items.map(async (item) => {
            if (!item.imageUrl) return { ...item, img: null, status: item.status || "Available" };

            try {
              const res = await fetch(
                `http://localhost:5000/api/images/signed/${item.imageUrl}`
              );
              const { url } = await res.json();
              return { ...item, img: url, status: item.status || "Available" };
            } catch (err) {
              console.error("Error getting signed URL:", err);
              return { ...item, img: null, status: item.status || "Available" };
            }
          })
        );
        setItemsWithUrls(updated);
      } finally {
        setLoadingImages(false);
      }
    }
    if (items.length > 0) {
      loadSignedURls();
    }
  }, [items]);



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
    return itemsWithUrls.filter((it) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        `${it.name} ${it.subcategory} ${it.color} ${it.size}`
          .toLowerCase()
          .includes(q);

      const matchesAvail =
        availability === "All Items" ||
        (availability === "Available" && it.status !== "Unavailable") ||
        (availability === "Unavailable" && it.status === "Unavailable");

      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(it.subcategory);

      const matchesSize =
        selectedSizes.size === 0 ||
        selectedSizes.has(it.size);

      const matchesColor =
        selectedColors.size === 0 ||
        selectedColors.has(it.color);

      return (
        matchesQuery &&
        matchesAvail &&
        matchesCategory &&
        matchesSize &&
        matchesColor
      );
    });
  }, [query, availability, selectedCategories, selectedSizes, selectedColors, itemsWithUrls]);

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
          totalCount={itemsWithUrls.length}
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
