import express from "express";
import * as clothingController from "../controllers/clothingController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all clothing items
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const userId = req.query.userId; // Optional filter
    const skip = (page - 1) * limit;

    const result = await clothingController.getAllItems(userId, { skip, limit });
    res.setHeader("Cache-Control", "public, max-age=300");
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch clothing items",
      message: error.message,
    });
  }
});

// GET single clothing item
router.get("/:clothingId", async (req, res) => {
  try {
    const result = await clothingController.getItemById(
      req.params.clothingId
    );
    res.json(result);
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      error: error.message || "Failed to fetch clothing item",
    });
  }
});

// -----------------------------
// DELETE clothing item (ADMIN)
// -----------------------------
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await clothingController.deleteItem(req.params.id);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
