// client/src/pages/UploadImages.jsx
import { useState } from "react";

export default function UploadImages() {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    clothingId: "",
    name: "",
    category: "",
    subcategory: "",
    size: "",
    color: "",
    season: "All",
    gender: "",
    tags: "",
  });

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const updateForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image.");

    setUploading(true);
    setResult(null);

    const data = new FormData();
    data.append("image", file);

    // Append all metadata
    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    const res = await fetch("http://localhost:5000/api/upload", {
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
      <p>Upload an image and fill in the metadata for the clothing item.</p>

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

        <label>
          Category:
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={updateForm}
            placeholder="Tops, Bottoms, Outerwear"
            required
          />
        </label>

        <label>
          Subcategory:
          <input
            type="text"
            name="subcategory"
            value={form.subcategory}
            onChange={updateForm}
            placeholder="Blazer, Pants, Skirt"
            required
          />
        </label>

        <label>
          Size:
          <input
            type="text"
            name="size"
            value={form.size}
            onChange={updateForm}
            placeholder="S, M, L, XL"
            required
          />
        </label>

        <label>
          Color:
          <input
            type="text"
            name="color"
            value={form.color}
            onChange={updateForm}
            placeholder="Black, Navy, White"
          />
        </label>

        <label>
          Season:
          <select name="season" value={form.season} onChange={updateForm}>
            <option>All</option>
            <option>Fall</option>
            <option>Winter</option>
            <option>Spring</option>
            <option>Summer</option>
          </select>
        </label>

        <label>
          Gender:
          <select name="gender" value={form.gender} onChange={updateForm}>
            <option value="">Select...</option>
            <option>Mens</option>
            <option>Womens</option>
            <option>Unisex</option>
          </select>
        </label>

        <label>
          Tags (comma separated):
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={updateForm}
            placeholder="dressy, blazer, interview"
          />
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
          <pre style={{ background: "#eee", padding: 10, marginTop: 10 }}>
            {JSON.stringify(result.item, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
