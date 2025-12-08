import * as clothingService from "../services/clothingService.js";
import { generateSignedUrl } from "../services/gcsService.js";

// In-memory cache for signed URLs to avoid regenerating on every request
const urlCache = new Map();
const CACHE_BUFFER_MS = 3600000; // Refresh 1 hour before expiry

function getCachedUrl(filePath) {
  const cached = urlCache.get(filePath);
  if (!cached) return null;
  
  const now = Date.now();
  if (cached.expiresAt > now + CACHE_BUFFER_MS) {
    return cached.url;
  }
  
  // Cache expired, remove it
  urlCache.delete(filePath);
  return null;
}

function setCachedUrl(filePath, url, expiresInSeconds) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  urlCache.set(filePath, { url, expiresAt });
}

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
  const itemsWithSignedUrls = await Promise.all(
    items.map(async (item) => {
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
        ...item.toObject(),
        thumbnailWebpUrl,
      };
    })
  );

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
