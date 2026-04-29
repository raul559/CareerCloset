import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorited,
} from "../controllers/favoriteController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all favorites for authenticated user - add cache headers
router.get("/", (req, res, next) => {
  // Cache for 5 minutes
  res.setHeader("Cache-Control", "private, max-age=300");
  next();
}, getFavorites);

// Check if specific item is favorited
router.get("/check/:clothingId", isFavorited);

// Add item to favorites
router.post("/:clothingId", addFavorite);

// Remove item from favorites
router.delete("/:clothingId", removeFavorite);

export default router;
