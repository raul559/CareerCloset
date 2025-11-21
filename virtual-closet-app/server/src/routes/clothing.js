import express from "express";
import * as clothingController from "../controllers/clothingController.js";

const router = express.Router();

// Get all clothing items for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || "test-user-123";
    const result = await clothingController.getAllItems(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch clothing items",
      message: error.message,
    });
  }
});

// Get single clothing item by ID
router.get("/:clothingId", async (req, res) => {
  try {
    const result = await clothingController.getItemById(req.params.clothingId);
    res.json(result);
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      error: error.message || "Failed to fetch clothing item",
      message: error.message,
    });
  }
});

export default router;
