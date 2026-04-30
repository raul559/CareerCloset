import Favorite from "../models/Favorite.js";
import ClothingItem from "../models/ClothingItem.js";

/**
 * Get all favorites for a user
 * GET /api/favorites?limit=100
 */
export async function getFavorites(req, res) {
  try {
    const userId = req.user.id || req.user.email;
    const limit = parseInt(req.query.limit) || 1000; // Default 1000, can be overridden

    console.log('[FAVORITE] Getting favorites:', { userId, limit });

    // First, count how many Favorite records exist for this user
    const favoriteCount = await Favorite.countDocuments({ userId });
    console.log('[FAVORITE] Favorite records found:', { userId, count: favoriteCount });

    // Use aggregation pipeline to fetch favorites with joined clothing data in one query
    const favorites = await Favorite.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "clothingitems",
          localField: "clothingId",
          foreignField: "clothingId",
          as: "clothingData",
        },
      },
      { $unwind: "$clothingData" },
      { $replaceRoot: { newRoot: "$clothingData" } },
      { $limit: limit },
    ]);

    console.log('[FAVORITE] Aggregation returned items:', { userId, itemsReturned: favorites.length });

    res.json({
      success: true,
      count: favorites.length,
      items: favorites,
    });
  } catch (error) {
    console.error("[FAVORITE] Error fetching favorites:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch favorites",
    });
  }
}

/**
 * Add a clothing item to favorites
 * POST /api/favorites/:clothingId
 */
export async function addFavorite(req, res) {
  try {
    const userId = req.user.id || req.user.email;
    const { clothingId } = req.params;

    console.log('[FAVORITE] Adding favorite:', { userId, clothingId });

    // Check if clothing item exists
    const clothingItem = await ClothingItem.findOne({ clothingId });
    if (!clothingItem) {
      console.warn('[FAVORITE] Clothing item not found:', { clothingId });
      return res.status(404).json({
        success: false,
        error: "Clothing item not found",
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ userId, clothingId });
    if (existing) {
      console.warn('[FAVORITE] Already favorited:', { userId, clothingId });
      return res.status(400).json({
        success: false,
        error: "Item already in favorites",
      });
    }

    // Create favorite
    const favorite = new Favorite({ userId, clothingId });
    await favorite.save();

    console.log('[FAVORITE] Successfully added:', { userId, clothingId });
    res.status(201).json({
      success: true,
      message: "Added to favorites",
      favorite,
    });
  } catch (error) {
    console.error("[FAVORITE] Error adding favorite:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: "Failed to add favorite",
    });
  }
}

/**
 * Remove a clothing item from favorites
 * DELETE /api/favorites/:clothingId
 */
export async function removeFavorite(req, res) {
  try {
    const userId = req.user.id || req.user.email;
    const { clothingId } = req.params;

    const result = await Favorite.deleteOne({ userId, clothingId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Favorite not found",
      });
    }

    res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove favorite",
    });
  }
}

/**
 * Check if a clothing item is favorited by user
 * GET /api/favorites/check/:clothingId
 */
export async function isFavorited(req, res) {
  try {
    const userId = req.user.id || req.user.email;
    const { clothingId } = req.params;

    const favorite = await Favorite.findOne({ userId, clothingId });

    res.json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check favorite",
    });
  }
}
