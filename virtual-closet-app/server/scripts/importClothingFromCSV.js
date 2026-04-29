import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import ClothingItem from "../src/models/ClothingItem.js";
import dotenv from "dotenv";

dotenv.config();

// Category mapping from CSV labels to app categories
const CATEGORY_MAP = {
  "T-Shirt": "Tops",
  "Shirt": "Tops",
  "Top": "Tops",
  "Blouse": "Tops",
  "Sweater": "Tops",
  "Pants": "Bottoms",
  "Jeans": "Bottoms",
  "Shorts": "Bottoms",
  "Skirt": "Bottoms",
  "Dress": "Dresses",
  "Outwear": "Outerwear",
  "Jacket": "Outerwear",
  "Coat": "Outerwear",
  "Shoes": "Shoes",
  "Boot": "Shoes",
  "Sneaker": "Shoes",
  "Sandal": "Shoes",
  "Other": "Accessories",
  "Accessory": "Accessories",
  "Hat": "Accessories",
  "Scarf": "Accessories",
  "Bag": "Accessories",
  "Not sure": "Uncategorized",
};

const COLORS = ["Black", "White", "Blue", "Red", "Green", "Gray", "Brown", "Pink", "Yellow", "Purple"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BUCKET_NAME = "career-closet-images";
const GCS_BASE_URL = `https://storage.googleapis.com/${BUCKET_NAME}`;
const IMAGE_FOLDER = "images_compressed"; // or "uploads" depending on where images are stored

let importedCount = 0;
let errorCount = 0;
const errors = [];

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

function mapCategory(csvLabel) {
  return CATEGORY_MAP[csvLabel] || "Uncategorized";
}

function generateRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateRandomSize() {
  return SIZES[Math.floor(Math.random() * SIZES.length)];
}

async function importCSV(filePath) {
  return new Promise((resolve, reject) => {
    const clothingItems = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const { image, sender_id, label, kids } = row;

          if (!image || !sender_id) {
            errorCount++;
            errors.push(`Skipped row: missing image or sender_id - ${JSON.stringify(row)}`);
            return;
          }

          // Construct image URL - try common patterns
          const imageUrl = `${GCS_BASE_URL}/${IMAGE_FOLDER}/${image}.jpg`;

          const clothingItem = {
            clothingId: image.substring(0, 10), // Use first 10 chars of UUID as clothingId
            name: `${label}${kids === "True" ? " (Kids)" : ""}`,
            category: mapCategory(label),
            subcategory: label,
            gender: "Unisex",
            size: generateRandomSize(),
            color: generateRandomColor(),
            season: "All",
            status: "Available",
            imageUrl: imageUrl,
            thumbnailWebp: null,
            tags: kids === "True" ? ["kids"] : [],
            userId: `user-${sender_id}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          clothingItems.push(clothingItem);
        } catch (error) {
          errorCount++;
          errors.push(`Error parsing row: ${error.message}`);
        }
      })
      .on("end", async () => {
        try {
          console.log(`📦 Inserting ${clothingItems.length} items into MongoDB...`);
          
          // Bulk insert with duplicate key handling - don't use ordered:false yet
          try {
            const result = await ClothingItem.insertMany(clothingItems, { ordered: true });
            importedCount = result.length;
            console.log(`✅ Successfully imported ${importedCount} clothing items`);
          } catch (insertError) {
            if (insertError.code === 11000) {
              // Try inserting one by one to skip duplicates
              console.log(`⚠️  Some duplicates found, inserting individually to skip them...`);
              let inserted = 0;
              for (const item of clothingItems) {
                try {
                  await ClothingItem.create(item);
                  inserted++;
                } catch (e) {
                  if (e.code !== 11000) {
                    errorCount++;
                    errors.push(`Failed to insert ${item.clothingId}: ${e.message}`);
                  }
                }
              }
              importedCount = inserted;
              console.log(`✅ Inserted ${inserted} new items (skipped duplicates)`);
            } else {
              throw insertError;
            }
          }
          
          if (errors.length > 0) {
            console.log(`⚠️  ${errorCount} errors encountered:`);
            errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
            if (errors.length > 10) {
              console.log(`   ... and ${errors.length - 10} more errors`);
            }
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function main() {
  const csvPath = process.argv[2] || "../../../images.csv";
  const fullPath = path.resolve(new URL(".", import.meta.url).pathname, csvPath);

  console.log("🚀 Starting clothing import from CSV...");
  console.log(`📁 CSV file: ${fullPath}`);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ CSV file not found: ${fullPath}`);
    process.exit(1);
  }

  try {
    await connectDatabase();
    await importCSV(fullPath);
    
    console.log("\n📊 Import Summary:");
    console.log(`   ✅ Imported: ${importedCount}`);
    console.log(`   ⚠️  Errors: ${errorCount}`);
    console.log(`   📍 Images base URL: ${GCS_BASE_URL}/${IMAGE_FOLDER}/`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    process.exit(1);
  }
}

main();
