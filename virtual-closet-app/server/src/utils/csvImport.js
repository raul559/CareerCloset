import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";

/**
 * Import clothing items from CSV file to MongoDB
 * Expected CSV columns: "Category ", "Size", "ClothingID"
 * @param {string} filePath - Path to the CSV file
 * @param {string} userId - User ID to associate items with
 * @returns {Promise<Object>} - Results of import (success count, errors)
 */
export async function importClothingFromCSV(filePath, userId) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let lineNumber = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        lineNumber++;
        try {
          // Get category with potential space at end
          const rawCategory = row["Category "] || row["Category"] || "";

          // Parse category to determine type and subtype
          const { category, subcategory, gender } = parseCategory(rawCategory);

          // Create clothing item object
          const item = {
            userId: userId,
            clothingId: row.ClothingID || "",
            name: rawCategory.trim() || "Unnamed Item",
            category: category,
            subcategory: subcategory,
            gender: gender,
            size: row.Size || "",
            color: "",
            season: "All",
            imageUrl: "",
            tags: [gender.toLowerCase(), subcategory.toLowerCase()],
          };

          results.push(item);
        } catch (error) {
          errors.push({
            line: lineNumber,
            error: error.message,
            data: row,
          });
        }
      })
      .on("end", () => {
        resolve({
          success: true,
          totalRows: lineNumber,
          validItems: results.length,
          errors: errors.length,
          items: results,
          errorDetails: errors,
        });
      })
      .on("error", (error) => {
        reject({
          success: false,
          error: error.message,
        });
      });
  });
}

/**
 * Parse category string into structured data
 * Examples: "Mens Pants" -> {category: "Bottoms", subcategory: "Pants", gender: "Mens"}
 * @param {string} rawCategory - Raw category from CSV
 * @returns {Object} - Parsed category data
 */
function parseCategory(rawCategory) {
  const normalized = rawCategory.trim();

  // Determine gender
  let gender = "Unisex";
  if (
    normalized.toLowerCase().startsWith("mens") ||
    normalized.toLowerCase().startsWith("men")
  ) {
    gender = "Mens";
  } else if (
    normalized.toLowerCase().startsWith("womens") ||
    normalized.toLowerCase().startsWith("women")
  ) {
    gender = "Womens";
  }

  // Extract subcategory (everything after gender prefix)
  let subcategory = normalized
    .replace(/^(Mens|Womens|Men|Women)\s*/i, "")
    .trim();

  // Map to main category
  let category = "Uncategorized";
  const subLower = subcategory.toLowerCase();

  if (
    subLower.includes("pant") ||
    subLower.includes("jean") ||
    subLower.includes("trouser")
  ) {
    category = "Bottoms";
  } else if (
    subLower.includes("shirt") ||
    subLower.includes("sleeve") ||
    subLower.includes("blouse") ||
    subLower.includes("top")
  ) {
    category = "Tops";
  } else if (subLower.includes("dress")) {
    category = "Dresses";
  } else if (
    subLower.includes("blazer") ||
    subLower.includes("jacket") ||
    subLower.includes("coat")
  ) {
    category = "Outerwear";
  } else if (subLower.includes("skirt")) {
    category = "Bottoms";
    subcategory = "Skirts";
  } else if (
    subLower.includes("shoe") ||
    subLower.includes("boot") ||
    subLower.includes("sneaker")
  ) {
    category = "Shoes";
  } else if (subLower.includes("accessor")) {
    category = "Accessories";
  }

  return { category, subcategory, gender };
}

/**
 * Save imported items to MongoDB
 * @param {Array} items - Array of clothing item objects
 * @param {Model} ClothingItemModel - Mongoose model for ClothingItem
 * @returns {Promise<Object>} - Results of save operation
 */
export async function saveImportedItems(items, ClothingItemModel) {
  try {
    const savedItems = await ClothingItemModel.insertMany(items, {
      ordered: false, // Continue inserting even if some fail
    });

    return {
      success: true,
      saved: savedItems.length,
      items: savedItems,
    };
  } catch (error) {
    // Handle duplicate key errors or validation errors
    const savedCount = error.insertedDocs ? error.insertedDocs.length : 0;

    return {
      success: false,
      saved: savedCount,
      failed: items.length - savedCount,
      error: error.message,
    };
  }
}
