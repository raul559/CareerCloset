import ClothingItem from "../models/ClothingItem.js";

/**
 * Find all items for a user (or all items if userId is null), with optional pagination and sorting
 */
export async function findByUserId(userId, options = {}) {
  const { limit = null, skip = 0, sortBy = "name", sortOrder = 1 } = options;
  const filter = userId ? { userId } : {}; // If no userId, fetch ALL items
  const query = ClothingItem.find(filter);

  // Apply sorting
  const sortOptions = {};
  if (sortBy === "name") {
    sortOptions.name = sortOrder; // 1 = asc, -1 = desc
  } else if (sortBy === "newest") {
    sortOptions.createdAt = -1; // Always newest first
  } else if (sortBy === "oldest") {
    sortOptions.createdAt = 1; // Oldest first
  }
  
  if (Object.keys(sortOptions).length > 0) {
    query.sort(sortOptions);
  }

  if (skip > 0) {
    query.skip(skip);
  }

  if (limit && typeof limit === "number" && limit > 0) {
    query.limit(limit);
  }

  return await query.exec();
}

/**
 * Count total items for a user (or all items if userId is null)
 */
export async function countByUserId(userId) {
  const filter = userId ? { userId } : {}; // If no userId, count ALL items
  return await ClothingItem.countDocuments(filter);
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
