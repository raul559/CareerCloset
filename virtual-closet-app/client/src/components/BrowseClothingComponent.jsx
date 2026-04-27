import React from "react";
import { useNavigate } from "react-router-dom";
import { useOutfit } from "../context/OutfitContext";
import { useAuth } from "../utils/auth";

// Color hex mapping
const COLOR_MAP = {
  "Black": "#1a1a1a",
  "Brown": "#8B6F47",
  "Green": "#4a7c59",
  "White": "#f5f5f5",
  "Gray": "#808080",
  "Tan": "#c9a961",
  "Navy": "#001f3f",
  "Blue": "#0074D9",
  "Yellow": "#FFDC00",
  "Red": "#E63946",
  "Pink": "#FF69B4",
  "Purple": "#9B59B6",
  "Orange": "#FF851B",
};

// Category icons mapping
const CATEGORY_ICONS = {
  "Tops": "👕",
  "Bottoms": "👖",
  "Dresses": "👗",
  "Outerwear": "🧥",
  "Shoes": "👠",
  "Accessories": "👜",
};

/** Sidebar with filters (chips + selectors) */
export function FiltersSidebar({
  query, setQuery,
  availability, setAvailability,
  CATEGORIES, SIZES, COLORS,
  selectedCategories, setSelectedCategories,
  selectedSizes, toggleSize,
  selectedColors, toggleColor,
  clearFilters, totalCount, filteredCount,
}) {
  return (
    <aside className="filters-sidebar card" style={{ position: "sticky", top: 12, padding: 16, borderRadius: 12 }}>
      {/* Search */}
      <div className="search" style={{ marginBottom: 12 }}>
        <input
          id="q"
          placeholder="Search clothing items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {/* Availability */}
        <section>
          <h3 style={{ marginBottom: 8, fontWeight: 700 }}>Availability</h3>
          <select
            aria-label="Availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10 }}
          >
            <option>All Items</option>
            <option>Available</option>
            <option>Unavailable</option>
          </select>
        </section>

        {/* Categories */}
        <section className="filter-group" style={{ paddingLeft: 12, paddingRight: 12 }}>
          <div className="filter-header" style={{ gap: 4, marginBottom: 14 }}>
            <h3 style={{ fontSize: "1.1rem", textDecoration: "underline", textTransform: "capitalize", margin: 0 }}>Categories</h3>
            <div className="filter-actions">
              <button type="button" className="btn-ghost" onClick={() => setSelectedCategories(new Set())}>
                Clear
              </button>
            </div>
          </div>

          <div className="chip-grid" role="group" aria-label="Categories">
            {/* Map all except Accessories */}
            {CATEGORIES.filter((x) => x !== "Accessories").map((c) => {
              const on = selectedCategories.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  className={`chip ${on ? "chip--on" : ""}`}
                  aria-pressed={on}
                  onClick={() =>
                    setSelectedCategories((prev) => {
                      const next = new Set(prev);
                      next.has(c) ? next.delete(c) : next.add(c);
                      return next;
                    })
                  }
                >
                  <span className="chip-dot" aria-hidden="true" />
                  <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>{CATEGORY_ICONS[c] || "👚"}</span>
                  <span>{c === "Outerwear" ? "Blazers" : c}</span>
                </button>
              );
            })}

            {/* Explicit Accessories chip to ensure consistent render */}
            {(() => {
              const c = "Accessories";
              const on = selectedCategories.has(c);
              return (
                <button
                  key="Accessories"
                  type="button"
                  className={`chip ${on ? "chip--on" : ""}`}
                  aria-pressed={on}
                  onClick={() =>
                    setSelectedCategories((prev) => {
                      const next = new Set(prev);
                      next.has(c) ? next.delete(c) : next.add(c);
                      return next;
                    })
                  }
                >
                  <span className="chip-dot" aria-hidden="true" />
                  <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>{CATEGORY_ICONS[c] || "👚"}</span>
                  <span>Accessories</span>
                </button>
              );
            })()}
          </div>
        </section>

        {/* Sizes */}
        <section>
          <h3 style={{ fontWeight: 700, fontSize: "1.1rem", textDecoration: "underline", marginBottom: 12 }}>Sizes</h3>
          <div className="size-filter">
            {SIZES.map((s) => (
              <label
                key={s}
                className={`size-label ${selectedSizes.has(s) ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.has(s)}
                  onChange={() => toggleSize(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section>
          <h3 style={{ fontWeight: 700, fontSize: "1.1rem", textDecoration: "underline", marginBottom: 12 }}>Colors</h3>
          <div className="color-filter">
            {COLORS.map((c) => (
              <label
                key={c}
                title={c}
                className={`color-label ${selectedColors.has(c) ? 'checked' : ''}`}
              >
                <span
                  className="color-swatch"
                  style={{ backgroundColor: COLOR_MAP[c] || "#ccc" }}
                />
                <input
                  type="checkbox"
                  checked={selectedColors.has(c)}
                  onChange={() => toggleColor(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </section>

        <button type="button" onClick={clearFilters} className="btn-outline" style={{ width: "100%" }}>
          Clear filters
        </button>

        <p className="meta" style={{ marginTop: 6 }} aria-live="polite">
          Showing <strong>{filteredCount}</strong> of {totalCount} items
        </p>
      </div>
    </aside>
  );
}

/** Individual item card with lazy loading */
export function ItemCard({ item, onDelete }) {
  const navigate = useNavigate();
  const { addToOutfit, availableItems } = useOutfit();
  const { isAdmin } = useAuth();
  const [isVisible, setIsVisible] = React.useState(false);
  const imgRef = React.useRef(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Load images 100px before they enter viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const mapCategory = (cat) => {
    const c = (cat || "").toLowerCase();
    switch (c) {
      case "tops":
        return "shirts";
      case "bottoms":
        return "pants";
      case "outerwear":
        return "outerwear";
      case "dresses":
        return "skirts"; // BuildOutfit groups dresses/skirts under 'skirts'
      case "shoes":
        return "shoes";
      case "accessories":
        return "accessories";
      default:
        return "shirts"; // fallback bucket
    }
  };

  const targetCategory = mapCategory(item.category);

  const isAlreadyAdded = (() => {
    const list = availableItems[targetCategory] || [];
    const id = item.clothingId || item.id;
    return list.some((i) => i.id === id);
  })();

  const handleAddToOutfit = () => {
    // Map API category (Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories)
    // to BuildOutfit categories (shirts, pants, outerwear, skirts, shoes, accessories)
    if (isAlreadyAdded) return; // safety guard
    // Ensure the BuildOutfit page has an 'img' field to render
    const outfitItem = {
      ...item,
      id: item.clothingId || item.id,
      img: item.thumbnailWebpUrl || item.imageUrl || item.img,
    };
    addToOutfit(targetCategory, outfitItem);
  };

  return (
    <article className="card item-card">
      <div style={{ position: "relative" }} ref={imgRef}>
        <img
          className="item-thumb-img"
          src={isVisible ? (item.thumbnailWebpUrl || item.imageUrl || item.img) : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23f0f0f0" width="300" height="400"/%3E%3C/svg%3E'}
          alt={`${item.name}, ${item.color}, size ${item.size}`}
          loading="lazy"
          style={{ opacity: isVisible ? 1 : 0.5, transition: 'opacity 0.3s' }}
        />
        <span className={`badge-chip ${item.status === "Unavailable" ? "unavailable" : ""}`}>
          {item.status || "Available"}
        </span>
      </div>
      <div className="item-body">
        <h3 className="item-title">{item.name}</h3>
        <p className="meta">
          {item.category} · {item.color} · Size {item.size} · #{item.clothingId}
        </p>
        <div className="btn-row">
          <button
            className="btn-outline"
            onClick={handleAddToOutfit}
            disabled={item.status === "Unavailable" || isAlreadyAdded}
            style={isAlreadyAdded ? { opacity: 0.6, cursor: "default" } : undefined}
          >
            {isAlreadyAdded ? "Added to Outfit" : "Add to Outfit"}
          </button>
          {isAdmin && onDelete && (
            <button
              className="btn-delete"
              onClick={() => {
                const id = item._id || item.clothingId || item.id;
                if (!id) return alert("Cannot determine item id");
                if (window.confirm("Delete this clothing item? This cannot be undone.")) {
                  onDelete(id);
                }
              }}
              style={{ background: "#c62828", color: "white", marginLeft: 8 }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}