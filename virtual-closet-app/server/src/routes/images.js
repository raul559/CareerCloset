import express from "express";
import * as imageController from "../controllers/imageController.js";
import { generateSignedUrl } from "../services/gcsService.js";

const router = express.Router();

// Get items missing images
router.get("/missing", async (req, res) => {
  try {
    // TODO: Replace hardcoded userId with req.user.id once user authentication is implemented
    // Remove userId from query params; extract from authenticated session instead
    const userId = req.query.userId || "virtual-closet-user";
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

// Sync URLs
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

router.get("/signed-webp/:filename", async (req, res) => {
  try {
    let original = req.params.filename;

    if (!original) {
      return res.status(400).json({ error: "Filename is required" });
    }

    // Remove 'Thumbnails-webp/' prefix if it exists
    let base = original.replace(/^Thumbnails-webp\//, "");

    // Remove file extension to get the base name
    base = base.replace(/\.(jpg|jpeg|webp|JPG|JPEG|WEBP)$/i, "");

    // Construct the webp path
    const webpPath = `Thumbnails-webp/${base}.webp`;

    try {
      // Attempt to use WebP version
      const url = await generateSignedUrl(webpPath);
      return res.json({ url });
    } catch (webpErr) {
      console.warn("WebP missing → falling back to JPG:", webpPath);

      // Fallback to original JPG file in root bucket
      const jpgPath = original;
      const url = await generateSignedUrl(jpgPath);

      return res.json({ url });
    }
  } catch (err) {
    console.error("Signed URL WebP error:", err);
    res.status(500).json({ error: "Failed to generate WebP or JPG URL" });
  }
});

export default router;
