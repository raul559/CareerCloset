// client/src/pages/UploadImages.jsx
import { useState } from "react";

export default function UploadImages() {
  const [file, setFile] = useState(null);

  // CATEGORIES
  const categories = [
    "Tops",
    "Bottoms",
    "Dresses",
    "Outerwear",
    "Shoes",
    "Accessories",
  ];

  // SUBCATEGORY MAPPING (from your MongoDB)
  const subcategoryMap = {
    Tops: ["Blazer", "Long Sleeve", "Short Sleeve"],
    Bottoms: ["Pants", "Skirts"],
    Dresses: ["Dresses"],
    Outerwear: ["Outerwear"],
    Shoes: ["Shoes"],
    Accessories: ["Accessories"],
  };

  // COLOR OPTIONS (cleaned standard list)
  const colors = [
    "Black",
    "White",
    "Navy",
    "Gray",
    "Blue",
    "Green",
    "Brown",
    "Tan",
    "Red",
    "Pink",
    "Purple",
    "Yellow",
    "Orange",
    "Beige",
    "Maroon",
  ];

  // SIZE OPTIONS (cleaned: letters first → pants sizes → misc)
  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "0",
    "2",
    "4",
    "6",
    "8",
    "10",
    "12",
    "14",
    "16",
    "28x30",
    "29x30",
    "30x30",
    "32x30",
    "34x30",
    "36x29",
    "36x30",
    "38x30",
    "44x30",
    "Petite XS",
    "Petite S",
    "Petite M",
    "Petite L",
  ];

  const [form, setForm] = useState({
    clothingId: "",
    name: "",
    category: "",
    subcategory: "",
    size: "",
    color: "",
    gender: "",
  });

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setForm({
      ...form,
      category: selected,
      subcategory: "", // reset subcategory
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image.");

    setUploading(true);
    setResult(null);

    const data = new FormData();
    data.append("image", file);

    Object.keys(form).forEach((key) => data.append(key, form[key]));

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    setUploading(false);
    setResult(json);
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h1>Upload Clothing Item</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {/* IMAGE FILE */}
        <label>
          Image File:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>

        {/* ID */}
        <label>
          Clothing ID:
          <input
            type="text"
            name="clothingId"
            value={form.clothingId}
            onChange={updateForm}
            placeholder="e.g., 1002"
            required
          />
        </label>

        {/* NAME */}
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={updateForm}
            placeholder="e.g., Women's Dress Shirt"
            required
          />
        </label>

        {/* CATEGORY DROPDOWN */}
        <label>
          Category:
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* SUBCATEGORY DROPDOWN */}
        <label>
          Subcategory:
          <select
            name="subcategory"
            value={form.subcategory}
            onChange={updateForm}
            required
            disabled={!form.category}
          >
            <option value="">Select...</option>
            {form.category &&
              subcategoryMap[form.category].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </label>

        {/* SIZE DROPDOWN */}
        <label>
          Size:
          <select name="size" value={form.size} onChange={updateForm} required>
            <option value="">Select...</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* COLOR DROPDOWN */}
        <label>
          Color:
          <select
            name="color"
            value={form.color}
            onChange={updateForm}
            required
          >
            <option value="">Select...</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* GENDER DROPDOWN */}
        <label>
          Gender:
          <select
            name="gender"
            value={form.gender}
            onChange={updateForm}
            required
          >
            <option value="">Select...</option>
            <option>Mens</option>
            <option>Womens</option>
            <option>Unisex</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={uploading}
          style={{
            padding: "10px",
            background: "#000",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Upload Successful!</h3>
          <img
            src={result.item?.imageUrl}
            alt="Uploaded"
            style={{ width: 200, borderRadius: 8 }}
          />
          <pre
            style={{
              background: "#eee",
              padding: 10,
              marginTop: 10,
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(result.item, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
