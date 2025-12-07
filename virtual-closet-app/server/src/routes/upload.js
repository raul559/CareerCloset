import express from "express";
import multer from "multer";
import { uploadImage } from "../services/storageService.js";
import ClothingItem from "../models/ClothingItem.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    // 1. Upload image to Google Cloud Storage
    const imageUrl = await uploadImage(
      req.file.buffer,
      req.file.originalname
    );

    // 2. Build clothing metadata object
    // TODO: Replace hardcoded userId with req.user.id once user authentication is implemented
    const itemData = {
      userId: "virtual-closet-user", // required by schema
      clothingId: req.body.clothingId,
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      size: req.body.size,
      color: req.body.color,
      season: req.body.season,
      gender: req.body.gender,
      tags: req.body.tags
        ? req.body.tags.split(",").map((t) => t.trim())
        : [],
      imageUrl,
    };

    // 3. Save to MongoDB
    const savedItem = await ClothingItem.create(itemData);

    // 4. Respond with saved item to match your frontend
    res.json({
      message: "Item uploaded & saved successfully",
      item: savedItem,
    });

  } catch (err) {
    console.error("Upload error:", err.message);
    console.error("Error details:", err);
    
    // Return detailed error for debugging
    const errorMessage = err.message.includes("E11000") 
      ? `Duplicate clothingId - this ID already exists. Please use a unique ID.`
      : err.message || "Image upload failed";
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;
