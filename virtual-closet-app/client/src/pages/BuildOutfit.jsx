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
    <div>
      <h1>Build Your Outfit</h1>
      <h4>Create and preview professional outfit combinations before your appointment.</h4>
      <br /><br />

      <div className="buildOutfitContainer">
        {/* LEFT PANEL */}
        <div className="leftPanel">
          <div className="categories">
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

          {/* Item grid */}
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
            <h2>Your Outfit</h2>
            {Object.keys(selectedItems).length === 0 ? (
              <p className="emptyMessage">No items selected yet.</p>
            ) : (
              <div className="selectedList">
                {Object.values(selectedItems).map((item) => (
                  <div key={item.id || item.clothingId} className="selectedItem">
                    <img src={item.thumbnailWebpUrl || item.img} alt={item.name} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="clearBtn" onClick={clearOutfit}>
              Clear Outfit
            </button>
          </div>

          <div className="tipsBox">
            <h3>Styling Tips</h3>
            <p>Dark blazer + light shirt = confident & professional.</p>
            <p>Accessories add personality to your look!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
