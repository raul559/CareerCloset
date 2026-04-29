import * as clothingService from "../services/clothingService.js";

/**
 * Get all clothing items for a user with pagination
 */
export async function getAllItems(userId, options = {}) {
  const { skip = 0, limit = 50 } = options;
  
  const [items, total] = await Promise.all([
    clothingService.findByUserId(userId, { skip, limit }),
    clothingService.countByUserId(userId)
  ]);

  // Return items with imageUrl as-is (bucket is now public with CORS configured)
  const itemsWithSignedUrls = items.map((item) => {
    return {
      ...item.toObject(),
      // imageUrl already contains the full public GCS URL, no need to sign
    };
  });

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
      // Check cache first before generating signed URL
      thumbnailWebpUrl = getCachedUrl(item.imageUrl);
      
      if (!thumbnailWebpUrl) {
        const webpUrl = await generateSignedUrl(item.imageUrl, 604800);
        thumbnailWebpUrl =
          webpUrl &&
          typeof webpUrl === "string" &&
          webpUrl.includes("googleapis.com")
            ? webpUrl
            : null;
        
        // Cache the signed URL for future requests
        if (thumbnailWebpUrl) {
          setCachedUrl(item.imageUrl, thumbnailWebpUrl, 604800);
        }
      }
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
