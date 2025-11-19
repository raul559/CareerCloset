// client/src/pages/UploadImages.jsx
import React, { useState } from "react";

export default function UploadImages() {
  const [image, setImage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleUpload = async () => {
    if (!image) return alert("Select a file first!");

    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploadedUrl(data.imageUrl);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload Images to Virtual Closet</h1>

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />

      <button onClick={handleUpload}>Upload</button>

      {uploadedUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={uploadedUrl} width="200" alt="uploaded" />
        </div>
      )}
    </div>
  );
}
