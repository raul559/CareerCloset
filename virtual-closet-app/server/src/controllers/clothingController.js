import * as clothingService from "../services/clothingService.js";
import { getSignedUrl } from "../services/gcsService.js";

/**
 * Get all clothing items for a user
 */
export async function getAllItems(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    clothingService.findByUserId(userId, limit, skip),
    clothingService.countByUserId(userId),
  ]);
  // Attach signed URLs for each item (if imageUrl exists)
  const itemsWithSignedUrls = await Promise.all(
    items.map(async (item) => {
      // Assume imageUrl is like 'originals/IMG_1234.JPG'
      let thumbnailWebpUrl = null;
      let thumbnailJpgUrl = null;
      if (item.imageUrl) {
        // Derive thumbnail paths based on naming convention
        const baseName = item.imageUrl.split('/').pop().replace(/\.[^.]+$/, '');
        const webpPath = `Thumbnails-webp/${baseName}.webp`;
        const jpgPath = `Thumbnails/${baseName}.JPG`;
        // Only set the URL if the file exists (signed URL is valid)
        try {
          const webpUrl = await getSignedUrl(webpPath);
          thumbnailWebpUrl = webpUrl && typeof webpUrl === 'string' && webpUrl.includes('googleapis.com') ? webpUrl : null;
        } catch (e) {
          thumbnailWebpUrl = null;
        }
        try {
          const jpgUrl = await getSignedUrl(jpgPath);
          thumbnailJpgUrl = jpgUrl && typeof jpgUrl === 'string' && jpgUrl.includes('googleapis.com') ? jpgUrl : null;
        } catch (e) {
          thumbnailJpgUrl = null;
        }
      }
      const signedUrl = item.imageUrl ? await getSignedUrl(item.imageUrl) : null;
      return {
        ...item.toObject(),
        signedUrl,
        thumbnailWebpUrl,
        thumbnailJpgUrl,
      };
    })
  );
  return {
    success: true,
    count: itemsWithSignedUrls.length,
    total,
    page,
    limit,
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
  let thumbnailJpgUrl = null;
  if (item.imageUrl) {
    const baseName = item.imageUrl.split('/').pop().replace(/\.[^.]+$/, '');
    const webpPath = `Thumbnails-webp/${baseName}.webp`;
    const jpgPath = `Thumbnails/${baseName}.JPG`;
    try {
      const webpUrl = await getSignedUrl(webpPath);
      thumbnailWebpUrl = webpUrl && typeof webpUrl === 'string' && webpUrl.includes('googleapis.com') ? webpUrl : null;
    } catch (e) {
      thumbnailWebpUrl = null;
    }
    try {
      const jpgUrl = await getSignedUrl(jpgPath);
      thumbnailJpgUrl = jpgUrl && typeof jpgUrl === 'string' && jpgUrl.includes('googleapis.com') ? jpgUrl : null;
    } catch (e) {
      thumbnailJpgUrl = null;
    }
  }
  const signedUrl = item.imageUrl ? await getSignedUrl(item.imageUrl) : null;
  return {
    success: true,
    item: {
      ...item.toObject(),
      signedUrl,
      thumbnailWebpUrl,
      thumbnailJpgUrl,
    },
  };
}
