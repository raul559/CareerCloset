import * as clothingService from "../services/clothingService.js";
import { generateSignedUrl } from "../services/gcsService.js";

/**
 * Get all clothing items for a user with pagination
 */
export async function getAllItems(userId, options = {}) {
  const { skip = 0, limit = 50 } = options;
  
  const [items, total] = await Promise.all([
    clothingService.findByUserId(userId, { skip, limit }),
    clothingService.countByUserId(userId)
  ]);

  // Attach signed URLs for each item (if imageUrl exists)
  const startTime = Date.now();
  const itemsWithSignedUrls = await Promise.all(
    items.map(async (item) => {
      let thumbnailWebpUrl = null;

      if (item.imageUrl) {
        try {
          const webpUrl = await generateSignedUrl(item.imageUrl, 604800);
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
  
  const duration = Date.now() - startTime;
  console.log(`Generated ${itemsWithSignedUrls.length} signed URLs in ${duration}ms`);

  return {
    success: true,
    count: itemsWithSignedUrls.length,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit),
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
      const webpUrl = await generateSignedUrl(item.imageUrl, 604800);
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
