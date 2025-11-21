// AI-Assisted Code Notice:
// The logic for paginated queries, mapping image URLs to signed URLs, and batch processing of 
// clothing items in this controller was optimized using AI

import ClothingItem from "../models/ClothingItem.js";

/**
 * Find all items for a user, with optional limit
 */
export async function findByUserId(userId, limit = 10, skip = 0) {
  const query = ClothingItem.find({ userId: userId || "default" })
    .skip(skip)
    .limit(limit);
  return await query.exec();
}

export async function countByUserId(userId) {
  return await ClothingItem.countDocuments({ userId: userId || "default" });
}

/**
 * Find a single item by clothingId
 */
export async function findByClothingId(clothingId) {
  return await ClothingItem.findOne({ clothingId: clothingId });
}

/**
 * Find items without image URLs
 */
export async function findItemsWithoutImages(userId, limit = null) {
  const query = ClothingItem.find({
    userId: userId || "default",
    $or: [
      { imageUrl: { $exists: false } },
      { imageUrl: null },
      { imageUrl: "" },
    ],
  });

  if (limit && typeof limit === "number" && limit > 0) {
    query.limit(limit);
  }

  return await query.exec();
}

/**
 * Count items without image URLs
 */
export async function countItemsWithoutImages(userId) {
  return await ClothingItem.countDocuments({
    userId: userId || "default",
    $or: [
      { imageUrl: { $exists: false } },
      { imageUrl: null },
      { imageUrl: "" },
    ],
  });
}

/**
 * Bulk update image URLs for items
 */
export async function bulkUpdateImageUrls(items, generateImageUrl) {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { clothingId: item.clothingId },
      update: { $set: { imageUrl: generateImageUrl(item.clothingId) } },
    },
  }));

  return await ClothingItem.bulkWrite(bulkOps);
}

/**
 * Update a clothing item by clothingId
 */
export async function updateByClothingId(clothingId, updates) {
  return await ClothingItem.findOneAndUpdate(
    { clothingId: clothingId },
    { $set: updates },
    { new: true, runValidators: true }
  );
}

/**
 * Delete a clothing item by clothingId
 */
export async function deleteByClothingId(clothingId) {
  return await ClothingItem.findOneAndDelete({ clothingId: clothingId });
}
