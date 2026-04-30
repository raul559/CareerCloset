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

// Get all favorites for authenticated user - NO caching to ensure fresh data
router.get("/", (req, res, next) => {
  // Don't cache - users expect immediate updates when adding/removing favorites
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}, getFavorites);

// Check if specific item is favorited
router.get("/check/:clothingId", isFavorited);

// Add item to favorites
router.post("/:clothingId", addFavorite);

// Remove item from favorites
router.delete("/:clothingId", removeFavorite);

export default router;
