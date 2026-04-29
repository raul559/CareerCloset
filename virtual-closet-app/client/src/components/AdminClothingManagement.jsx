import { useEffect, useState } from "react";

import {
  getAllClothing,
  updateClothingItem,
  deleteClothingItem,
  updateImageMetadata,
  deleteImage,
} from "../services/adminApi";

export default function AdminClothingManagement() {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [imageEditItem, setImageEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const load = () => {
    getAllClothing().then((res) => setItems(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const saveEdit = () => {
    updateClothingItem(editItem._id, editItem).then((res) => {
      setEditItem(null);
      load();
      try {
        // Notify other open pages (same-tab) that items changed
        window.dispatchEvent(new CustomEvent('virtualcloset:itemsUpdated', { detail: { id: res.data._id } }));
        // Also write a small localStorage ping so other tabs receive a storage event
        try {
          localStorage.setItem('virtualcloset:itemsUpdated', JSON.stringify({ id: res.data._id, ts: Date.now() }));
        } catch (e) {
          // ignore storage failures (private mode, etc.)
        }
      } catch (e) {
        // ignore in non-browser environments
      }
    });
  };

  return (
    <div>
      <h2>Clothing Management</h2>
      <p style={{ marginBottom: "15px", color: "#666" }}>
        Total Items: {items.length} | Page {currentPage} of {totalPages}
      </p>

      {paginatedItems.map((i) => (
        <div key={i._id} style={styles.card}>
          <img src={i.thumbnailWebpUrl || i.imageUrl} style={styles.img} alt={i.name} />

          <div>
            <p><strong>{i.name}</strong></p>
            <p>{i.category} · Size {i.size}</p>

            <button style={styles.button} onClick={() => setEditItem(i)}>
              Edit
            </button>
            <button
              style={styles.button}
              onClick={() => {
                // prepare image edit payload
                setImageEditItem({
                  _id: i._id,
                  imageUrl: i.imageUrl || "",
                  thumbnailWebp: i.thumbnailWebp || "",
                  tags: (i.tags || []).join(", "),
                  name: i.name || "",
                  category: i.category || "",
                  subcategory: i.subcategory || "",
                  size: i.size || "",
                  color: i.color || "",
                  gender: i.gender || "",
                  season: i.season || "",
                  status: i.status || (i.status === 0 ? i.status : "Available"),
                });
              }}
            >
              Edit Image
            </button>
            <button
              style={styles.delete}
              onClick={() =>
                // confirm before deleting image
                window.confirm("Delete image for this item?") &&
                deleteImage(i._id).then(() => load())
              }
            >
              Delete Image
            </button>
            <button
              style={styles.delete}
              onClick={() => deleteClothingItem(i._id).then(load)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* EDIT MODAL */}
      {editItem && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Edit Clothing Item</h3>

            <input
              style={styles.input}
              value={editItem.name}
              placeholder="Name"
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
            />

            <select
              style={styles.input}
              value={editItem.category}
              onChange={(e) =>
                setEditItem({ ...editItem, category: e.target.value })
              }
            >
              <option value="">Category</option>
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Dresses">Dresses</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>

            <input
              style={styles.input}
              value={editItem.subcategory}
              placeholder="Subcategory"
              onChange={(e) => setEditItem({ ...editItem, subcategory: e.target.value })}
            />

            <select
              style={styles.input}
              value={editItem.size}
              onChange={(e) =>
                setEditItem({ ...editItem, size: e.target.value })
              }
            >
              <option value="">Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>

            <input
              style={styles.input}
              value={editItem.color}
              placeholder="Color"
              onChange={(e) => setEditItem({ ...editItem, color: e.target.value })}
            />

            <select
              style={styles.input}
              value={editItem.gender}
              onChange={(e) =>
                setEditItem({ ...editItem, gender: e.target.value })
              }
            >
              <option value="">Gender</option>
              <option value="Mens">Mens</option>
              <option value="Womens">Womens</option>
              <option value="Unisex">Unisex</option>
            </select>

            <select
              style={styles.input}
              value={editItem.season}
              onChange={(e) =>
                setEditItem({ ...editItem, season: e.target.value })
              }
            >
              <option value="">Season</option>
              <option value="All">All</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>

            <select
              style={styles.input}
              value={editItem.status || "Available"}
              onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            <button style={styles.button} onClick={saveEdit}>
              Save
            </button>
            <button style={styles.delete} onClick={() => setEditItem(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* IMAGE EDIT MODAL */}
      {imageEditItem && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Edit Image Metadata</h3>

            <input
              style={styles.input}
              value={imageEditItem.name}
              placeholder="Name"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, name: e.target.value })
              }
            />

            <select
              style={styles.input}
              value={imageEditItem.category}
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, category: e.target.value })
              }
            >
              <option value="">Category</option>
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Dresses">Dresses</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>

            <input
              style={styles.input}
              value={imageEditItem.subcategory}
              placeholder="Subcategory"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, subcategory: e.target.value })
              }
            />

            <select
              style={styles.input}
              value={imageEditItem.size}
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, size: e.target.value })
              }
            >
              <option value="">Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>

            <input
              style={styles.input}
              value={imageEditItem.color}
              placeholder="Color"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, color: e.target.value })
              }
            />

            <select
              style={styles.input}
              value={imageEditItem.gender}
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, gender: e.target.value })
              }
            >
              <option value="">Gender</option>
              <option value="Mens">Mens</option>
              <option value="Womens">Womens</option>
              <option value="Unisex">Unisex</option>
            </select>

            <select
              style={styles.input}
              value={imageEditItem.season}
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, season: e.target.value })
              }
            >
              <option value="">Season</option>
              <option value="All">All</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>

            <select
              style={styles.input}
              value={imageEditItem.status || "Available"}
              onChange={(e) => setImageEditItem({ ...imageEditItem, status: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            <input
              style={styles.input}
              value={imageEditItem.imageUrl}
              placeholder="Image URL"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, imageUrl: e.target.value })
              }
            />

            <input
              style={styles.input}
              value={imageEditItem.thumbnailWebp}
              placeholder="Thumbnail WebP"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, thumbnailWebp: e.target.value })
              }
            />

            <input
              style={styles.input}
              value={imageEditItem.tags}
              placeholder="Tags (comma separated)"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, tags: e.target.value })
              }
            />

            <div>
              <button
                style={styles.button}
                onClick={() => {
                  // prepare payload
                  const payload = {
                    name: imageEditItem.name || undefined,
                    category: imageEditItem.category || undefined,
                    subcategory: imageEditItem.subcategory || undefined,
                    size: imageEditItem.size || undefined,
                    color: imageEditItem.color || undefined,
                    gender: imageEditItem.gender || undefined,
                    season: imageEditItem.season || undefined,
                    status: imageEditItem.status || undefined,
                    imageUrl: imageEditItem.imageUrl || undefined,
                    thumbnailWebp: imageEditItem.thumbnailWebp || undefined,
                    tags: imageEditItem.tags
                      ? imageEditItem.tags.split(",").map((t) => t.trim()).filter(Boolean)
                      : undefined,
                  };

                  updateImageMetadata(imageEditItem._id, payload).then(() => {
                    setImageEditItem(null);
                    load();
                    try {
                      window.dispatchEvent(new CustomEvent('virtualcloset:itemsUpdated', { detail: { id: imageEditItem._id } }));
                      try {
                        localStorage.setItem('virtualcloset:itemsUpdated', JSON.stringify({ id: imageEditItem._id, ts: Date.now() }));
                      } catch (e) { }
                    } catch (e) { }
                  });
                }}
              >
                Save Changes
              </button>

              <button style={styles.delete} onClick={() => setImageEditItem(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {items.length > itemsPerPage && (
        <div style={styles.pagination}>
          <button
            style={styles.paginationButton}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            ⟨⟨ First
          </button>
          <button
            style={styles.paginationButton}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ⟨ Prev
          </button>

          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            style={styles.paginationButton}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next ⟩
          </button>
          <button
            style={styles.paginationButton}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last ⟩⟩
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    gap: "20px",
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  img: {
    width: "100px",
    height: "100px",
    borderRadius: "6px",
    objectFit: "cover",
  },
  button: {
    marginRight: "10px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  delete: {
    background: "red",
    color: "white",
    padding: "6px 10px",
    cursor: "pointer",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    width: "300px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "30px",
    padding: "20px",
  },
  paginationButton: {
    padding: "8px 12px",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
    fontSize: "14px",
  },
};
