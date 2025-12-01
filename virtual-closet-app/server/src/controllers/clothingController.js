import * as clothingService from "../services/clothingService.js";
import { generateSignedUrl } from "../services/gcsService.js";

/**
 * Get all clothing items for a user
 */
export async function getAllItems(userId) {
  const items = await clothingService.findByUserId(userId);

  // Attach signed URLs for each item (if imageUrl exists)
  const itemsWithSignedUrls = await Promise.all(
    items.map(async (item) => {
      let thumbnailWebpUrl = null;

      if (item.imageUrl) {
        // imageUrl is like 'Thumbnails-webp/IMG_3233.webp'
        try {
          const webpUrl = await generateSignedUrl(item.imageUrl);
          thumbnailWebpUrl =
            webpUrl &&
            typeof webpUrl === "string" &&
            webpUrl.includes("googleapis.com")
              ? webpUrl
              : null;
        } catch (e) {
          console.error(
            `Failed to generate signed URL for ${item.imageUrl}:`,
            e.message
          );
          thumbnailWebpUrl = null;
        }
      }

      return {
        ...item.toObject(),
        thumbnailWebpUrl,
      };
    })
  );

  return {
    success: true,
    count: itemsWithSignedUrls.length,
    items: itemsWithSignedUrls,
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

  let thumbnailWebpUrl = null;

  if (item.imageUrl) {
    try {
      const webpUrl = await generateSignedUrl(item.imageUrl);
      thumbnailWebpUrl =
        webpUrl &&
        typeof webpUrl === "string" &&
        webpUrl.includes("googleapis.com")
          ? webpUrl
          : null;
    } catch (e) {
      console.error(
        `Failed to generate signed URL for ${item.imageUrl}:`,
        e.message
      );
      thumbnailWebpUrl = null;
    }
  }

  return {
    success: true,
    item: {
      ...item.toObject(),
      thumbnailWebpUrl,
    },
  };
}
