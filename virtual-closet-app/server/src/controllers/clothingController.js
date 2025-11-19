import * as clothingService from "../services/clothingService.js";

/**
 * Get all clothing items for a user
 */
export async function getAllItems(userId) {
  const items = await clothingService.findByUserId(userId);
  return {
    success: true,
    count: items.length,
    items: items,
  };
}

/**
 * Get single clothing item by clothingId
 */
export async function getItemById(clothingId) {
  const item = await clothingService.findByClothingId(clothingId);

  if (!item) {
    const error = new Error("No clothing item found with ID: " + clothingId);
    error.status = 404;
    throw error;
  }

  return {
    success: true,
    item: item,
  };
}
