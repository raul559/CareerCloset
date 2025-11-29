import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext";
import { useOutfit } from "../context/OutfitContext";

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
    <aside className="card" style={{ position: "sticky", top: 12, padding: 16, borderRadius: 12 }}>
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
          <h3 style={{ marginBottom: 8 }}>Availability</h3>
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
        <section className="filter-group">
          <div className="filter-header">
            <h3>Categories</h3>
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
                  <span>{c}</span>
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
                  <span>Accessories</span>
                </button>
              );
            })()}
          </div>
        </section>

        {/* Sizes */}
        <section>
          <h3 style={{ marginBottom: 8 }}>Sizes</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SIZES.map((s) => (
              <label
                key={s}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  border: "1px solid rgba(0,0,0,.15)",
                  borderRadius: 999,
                  background: selectedSizes.has(s) ? "black" : "white",
                  color: selectedSizes.has(s) ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.has(s)}
                  onChange={() => toggleSize(s)}
                  style={{ display: "none" }}
                />
                {s}
              </label>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section>
          <h3 style={{ marginBottom: 8 }}>Colors</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COLORS.map((c) => (
              <label
                key={c}
                title={c}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  border: "1px solid rgba(0,0,0,.15)",
                  borderRadius: 999,
                  background: selectedColors.has(c) ? "black" : "white",
                  color: selectedColors.has(c) ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedColors.has(c)}
                  onChange={() => toggleColor(c)}
                  style={{ display: "none" }}
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

/** Individual item card */
export function ItemCard({ item }) {
  const navigate = useNavigate();
  const { addItem } = useAppointment();
  const { addToOutfit } = useOutfit();

  const handleReserve = () => {
    addItem(item);
    navigate("/book");
  };

  const handleAddToOutfit = () => {
    addToOutfit(item.category.toLowerCase(), item);
  };

  return (
    <article className="card item-card">
      <div style={{ position: "relative" }}>
        <img
          className="item-thumb-img"
          src={item.img}
          alt={`${item.name}, ${item.color}, size ${item.size}`}
        />
        <span className={`badge-chip ${item.status === "Unavailable" ? "unavailable" : ""}`}>
          {item.status}
        </span>
      </div>
      <div className="item-body">
        <h3 className="item-title">{item.name}</h3>
        <p className="meta">
          {item.category} · {item.color} · Size {item.size} · #{item.id}
        </p>
        <div className="btn-row">
          <button 
            className="btn" 
            onClick={handleReserve}
            disabled={item.status === "Unavailable"}
            style={{ 
              opacity: item.status === "Unavailable" ? 0.5 : 1,
              cursor: item.status === "Unavailable" ? "not-allowed" : "pointer"
            }}
          >
            Reserve
          </button>
          <button 
            className="btn-outline"
            onClick={handleAddToOutfit}
            disabled={item.status === "Unavailable"}
          >
            Add to Outfit
          </button>
        </div>
      </div>
    </article>
  );
}