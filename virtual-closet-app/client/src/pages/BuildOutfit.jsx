import { useState } from "react";
import { useOutfit } from "../context/OutfitContext";
import "../styles/buildOutfit.css";

export default function BuildOutfit() {
  const { availableItems, selectedItems, selectOutfitItem, clearOutfit } = useOutfit();
  const [activeCategory, setActiveCategory] = useState("shirts");

  const categories = [
    { id: "outerwear", label: "Blazers & Jackets" },
    { id: "shirts", label: "Shirts & Blouses" },
    { id: "pants", label: "Pants" },
    { id: "skirts", label: "Skirts" },
    { id: "shoes", label: "Shoes" },
    { id: "accessories", label: "Accessories" },
  ];

  const filteredItems = availableItems[activeCategory] || [];

  return (
    <div className="buildOutfitPage">
      <div className="pageHeader">
        <h1>Build Your Outfit</h1>
        <p className="pageSubtitle">Create and preview professional outfit combinations to help you succeed in your career journey.</p>
      </div>

      <div className="buildOutfitContainer">
        {/* CATEGORY SIDEBAR */}
        <div className="categorySidebar">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`categoryBtn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* MIDDLE PANEL - Item grid */}
        <div className="middlePanel">
          <div className="itemGrid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id || item.clothingId}
                  className={`itemCard ${selectedItems[activeCategory]?.id === item.id ? "selected" : ""}`}
                  onClick={() => selectOutfitItem(activeCategory, item)}
                >
                  <img src={item.thumbnailWebpUrl || item.img} alt={item.name} />
                  <p>{item.name}</p>
                </div>
              ))
            ) : (
              <p className="emptyMessage">No items available in this category.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="rightSide">
          <div className="rightPanel">
            <div className="panelHeader">
              <h2>Your Outfit</h2>
              <span className="itemCount">{Object.keys(selectedItems).length} {Object.keys(selectedItems).length === 1 ? 'item' : 'items'}</span>
            </div>
            {Object.keys(selectedItems).length === 0 ? (
              <div className="emptyState">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4z" />
                </svg>
                <p>Select items from the left to build your outfit</p>
              </div>
            ) : (
              <div className="selectedList">
                {Object.values(selectedItems).map((item) => (
                  <div key={item.id || item.clothingId} className="selectedItem">
                    <img src={item.thumbnailWebpUrl || item.img} alt={item.name} />
                    <div className="selectedItemInfo">
                      <span className="selectedItemName">{item.name}</span>
                      <span className="selectedItemMeta">{item.color} · Size {item.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="clearBtn" onClick={clearOutfit} disabled={Object.keys(selectedItems).length === 0}>
              Clear Outfit
            </button>
          </div>

          <div className="tipsBox">
            <h3>💡 Styling Tips</h3>
            <ul>
              <li>Pair a dark blazer with a light shirt for a confident, professional look</li>
              <li>Choose accessories that complement your outfit colors</li>
              <li>Ensure shoes match the formality of your attire</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
