import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    clothingId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each user can only favorite a clothing item once
favoriteSchema.index({ userId: 1, clothingId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
