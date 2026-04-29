import api from "./api.js";
import { auth } from "../utils/auth.js";

// Simple cache for favorites to avoid duplicate API calls
let favoritesCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minute cache

/**
 * Get all favorited clothing items for authenticated user
 */
export async function getFavorites() {
  try {
    // Return cached data if still fresh
    const now = Date.now();
    if (favoritesCache !== null && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
      return favoritesCache;
    }

    const response = await api.get("/favorites");
    const items = response.data.items || [];
    
    // Update cache
    favoritesCache = items;
    cacheTimestamp = now;
    
    return items;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}

/**
 * Invalidate favorites cache
 */
export function invalidateFavoritesCache() {
  favoritesCache = null;
  cacheTimestamp = null;
}

/**
 * Add a clothing item to favorites
 * @param {string} clothingId - The ID of the clothing item
 */
export async function addFavorite(clothingId) {
  try {
    const user = auth.getCurrentUser();
    console.log('[FAVORITES] Adding favorite:', { clothingId, userEmail: user?.email });
    
    const response = await api.post(`/favorites/${clothingId}`);
    console.log('[FAVORITES] Successfully added favorite:', response.data);
    invalidateFavoritesCache(); // Clear cache so next fetch gets fresh data
    return response.data;
  } catch (error) {
    console.error("[FAVORITES] Error adding favorite:", {
      clothingId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.response?.data || error,
    });
    throw error;
  }
}

/**
 * Remove a clothing item from favorites
 * @param {string} clothingId - The ID of the clothing item
 */
export async function removeFavorite(clothingId) {
  try {
    const user = auth.getCurrentUser();
    console.log('[FAVORITES] Removing favorite:', { clothingId, userEmail: user?.email });
    
    const response = await api.delete(`/favorites/${clothingId}`);
    console.log('[FAVORITES] Successfully removed favorite:', response.data);
    invalidateFavoritesCache(); // Clear cache so next fetch gets fresh data
    return response.data;
  } catch (error) {
    console.error("[FAVORITES] Error removing favorite:", {
      clothingId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.response?.data || error,
    });
    throw error;
  }
}

/**
 * Check if a clothing item is favorited by user
 * @param {string} clothingId - The ID of the clothing item
 */
export async function checkIsFavorited(clothingId) {
  try {
    const response = await api.get(`/favorites/check/${clothingId}`);
    return response.data.isFavorited;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
}
