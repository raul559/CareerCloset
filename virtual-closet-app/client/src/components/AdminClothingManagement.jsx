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

  const load = () => {
    getAllClothing().then((res) => setItems(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const saveEdit = () => {
    updateClothingItem(editItem._id, editItem).then(() => {
      setEditItem(null);
      load();
    });
  };

  return (
    <div>
      <h2>Clothing Management</h2>

      {items.map((i) => (
        <div key={i._id} style={styles.card}>
          <img src={i.imageUrl} style={styles.img} />

          <div>
            <p><strong>{i.name}</strong></p>
            <p>{i.category}</p>

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
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
            />

            <input
              style={styles.input}
              value={editItem.category}
              onChange={(e) =>
                setEditItem({ ...editItem, category: e.target.value })
              }
            />

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
              value={imageEditItem.imageUrl}
              placeholder="imageUrl"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, imageUrl: e.target.value })
              }
            />

            <input
              style={styles.input}
              value={imageEditItem.thumbnailWebp}
              placeholder="thumbnailWebp"
              onChange={(e) =>
                setImageEditItem({ ...imageEditItem, thumbnailWebp: e.target.value })
              }
            />

            <input
              style={styles.input}
              value={imageEditItem.tags}
              placeholder="tags (comma separated)"
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
                    imageUrl: imageEditItem.imageUrl || undefined,
                    thumbnailWebp: imageEditItem.thumbnailWebp || undefined,
                    tags: imageEditItem.tags
                      ? imageEditItem.tags.split(",").map((t) => t.trim()).filter(Boolean)
                      : undefined,
                  };

                  updateImageMetadata(imageEditItem._id, payload).then(() => {
                    setImageEditItem(null);
                    load();
                  });
                }}
              >
                Save Image Metadata
              </button>

              <button style={styles.delete} onClick={() => setImageEditItem(null)}>
                Cancel
              </button>
            </div>
          </div>
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
};
