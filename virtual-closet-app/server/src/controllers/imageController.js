import * as clothingService from "../services/clothingService.js";

/**
 * Get items missing images
 */
export async function getItemsMissingImages(userId, limit) {
  const itemsWithoutImages = await clothingService.findItemsWithoutImages(
    userId,
    limit
  );
  const totalMissing = await clothingService.countItemsWithoutImages(userId);

  return {
    success: true,
    totalMissing: totalMissing,
    showing: itemsWithoutImages.length,
    items: itemsWithoutImages,
    message: `${totalMissing} items are missing image URLs`,
  };
}

/**
 * Sync image URLs - bulk update MongoDB with constructed image URLs
 */
export async function syncImageUrls(options) {
  const { bucketName, imageExtension, userId, dryRun } = options;
  const baseUrl = `https://storage.googleapis.com/${bucketName}`;

  // Get items to update
  const items = await clothingService.findByUserId(userId);

  if (items.length === 0) {
    return {
      success: true,
      message: "No items found to update",
      updated: 0,
    };
  }

  // Dry run - preview only
  if (dryRun === true) {
    const preview = items.slice(0, 10).map((item) => ({
      clothingId: item.clothingId,
      currentUrl: item.imageUrl || "(empty)",
      newUrl: `${baseUrl}/${item.clothingId}.${imageExtension}`,
    }));

    return {
      success: true,
      message: "Dry run - no changes made",
      totalItems: items.length,
      preview: preview,
      note: "Set dryRun=false to apply changes",
    };
  }

  // Perform actual sync
  const imageUrl = (clothingId) => `${baseUrl}/${clothingId}.${imageExtension}`;
  await clothingService.bulkUpdateImageUrls(items, imageUrl);

  // Get updated statistics
  const updatedItems = await clothingService.findByUserId(userId);
  const itemsWithImages = updatedItems.filter((item) => item.imageUrl).length;

  return {
    success: true,
    message: "Image URLs synced successfully",
    bucketName: bucketName,
    baseUrl: baseUrl,
    totalItems: items.length,
    itemsUpdated: items.length,
    itemsWithImages: itemsWithImages,
    pattern: `${baseUrl}/{clothingId}.${imageExtension}`,
  };
}
