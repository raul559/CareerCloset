import express from "express";
import * as imageController from "../controllers/imageController.js";
import { generateSignedUrl } from "../services/gcsService.js";

const router = express.Router();

// Get items missing images
router.get("/missing", async (req, res) => {
  try {
    const userId = req.query.userId || "test-user-123";
    const limit = parseInt(req.query.limit) || 50;

    const result = await imageController.getItemsMissingImages(userId, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch items missing images",
      message: error.message,
    });
  }
});

// Sync image URLs - bulk update MongoDB with constructed image URLs
router.put("/sync-urls", async (req, res) => {
  try {
    const {
      bucketName = "virtual-closet-images",
      imageExtension = "jpg",
      userId,
      dryRun = false,
    } = req.body;

    const result = await imageController.syncImageUrls({
      bucketName,
      imageExtension,
      userId,
      dryRun,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to sync image URLs",
      message: error.message,
    });
  }
});

router.get("/signed/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    const url = await generateSignedUrl(filename);
    return res.json({ url });
  } catch (err) {
    console.error("Signed URL error:", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

export default router;
