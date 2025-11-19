// server/src/routes/upload.js
import express from "express";
import multer from "multer";
import { uploadImage } from "../services/storageService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    const imageUrl = await uploadImage(req.file.buffer, req.file.originalname);

    res.json({
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

export default router;
