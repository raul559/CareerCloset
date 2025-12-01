import mongoose from "mongoose";

const clothingItemSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    clothingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Tops",
        "Bottoms",
        "Dresses",
        "Outerwear",
        "Shoes",
        "Accessories",
        "Uncategorized",
      ],
      default: "Uncategorized",
    },
    subcategory: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Mens", "Womens", "Unisex"],
      default: "Unisex",
    },
    size: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    season: {
      type: String,
      enum: ["Spring", "Summer", "Fall", "Winter", "All"],
      default: "All",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    thumbnailWebp: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
clothingItemSchema.index({ userId: 1, category: 1 });
clothingItemSchema.index({ userId: 1, season: 1 });

const ClothingItem = mongoose.model("ClothingItem", clothingItemSchema);

export default ClothingItem;
