import User from "../models/user.js";
import Clothing from "../models/ClothingItem.js"; 
import { deleteFile as deleteGcsFile, generateSignedUrl } from "../services/gcsService.js";
// import Outfit from "../models/Outfit.js";   // add when you create it
// import Appointment from "../models/Appointment.js"; // add when you create it

// -------- USERS --------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // don't leak passwords
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // "user" or "admin"

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("updateUserRole error:", err);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// -------- CLOTHING --------
export const getAllClothing = async (req, res) => {
  try {
    const items = await Clothing.find();
    
    // Generate signed URLs for all items
    const itemsWithSignedUrls = await Promise.all(
      items.map(async (item) => {
        let thumbnailWebpUrl = null;
        
        if (item.imageUrl) {
          try {
            const url = await generateSignedUrl(item.imageUrl, 604800);
            if (url && typeof url === "string" && url.includes("googleapis.com")) {
              thumbnailWebpUrl = url;
            }
          } catch {
            thumbnailWebpUrl = null;
          }
        }
        
        return { ...item.toObject(), thumbnailWebpUrl };
      })
    );
    
    res.json(itemsWithSignedUrls);
  } catch (err) {
    console.error("getAllClothing error:", err);
    res.status(500).json({ message: "Failed to fetch clothing items" });
  }
};

export const updateClothingItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // e.g. { size, category, status }

    const updated = await Clothing.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("updateClothingItem error:", err);
    res.status(500).json({ message: "Failed to update clothing item" });
  }
};

export const deleteClothingItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Clothing.findById(id);
    if (!deleted) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    // If item has imageUrl, attempt to delete from GCS (best-effort)
    if (deleted.imageUrl) {
      try {
        // Try to derive file path from imageUrl if it's a google storage url
        // Expected forms: https://storage.googleapis.com/<bucket>/<path>
        const match = deleted.imageUrl.match(/https?:\/\/[^/]+\/[^/]+\/(.+)$/);
        const filePath = match ? match[1] : null;
        if (filePath) {
          await deleteGcsFile(filePath);
        }
      } catch (err) {
        console.warn("Warning: failed to delete GCS file for clothing item:", err.message);
      }
    }

    await Clothing.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    res.json({ message: "Clothing item deleted successfully" });
  } catch (err) {
    console.error("deleteClothingItem error:", err);
    res.status(500).json({ message: "Failed to delete clothing item" });
  }
};

// -------- IMAGES (admin) --------
/**
 * Update image-related metadata on a clothing item (admin)
 * Accepts body fields like: imageUrl, thumbnailWebp, tags (array), name, category, size, color, subcategory
 */
export const updateImageMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};

    const allowed = [
      "imageUrl",
      "thumbnailWebp",
      "tags",
      "name",
      "category",
      "subcategory",
      "size",
      "color",
      "season",
      "gender",
    ];

    const payload = {};
    for (const k of Object.keys(updateData)) {
      if (allowed.includes(k)) payload[k] = updateData[k];
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await Clothing.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Clothing item not found" });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateImageMetadata error:", err);
    res.status(500).json({ message: "Failed to update image metadata" });
  }
};

/**
 * Delete an image for a clothing item: removes object from GCS and clears DB fields
 */
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Clothing.findById(id);
    if (!item) return res.status(404).json({ message: "Clothing item not found" });

    if (!item.imageUrl) {
      return res.status(400).json({ message: "No image associated with this item" });
    }

    // Try to derive file path from imageUrl
    const match = item.imageUrl.match(/https?:\/\/[^/]+\/[^/]+\/(.+)$/);
    const filePath = match ? match[1] : null;

    if (filePath) {
      try {
        await deleteGcsFile(filePath);
      } catch (err) {
        // log but continue to clear DB entry
        console.warn("Warning: failed to delete GCS file:", err.message);
      }
    }

    // Clear DB image fields
    item.imageUrl = "";
    item.thumbnailWebp = "";
    await item.save();

    res.json({ success: true, message: "Image deleted and metadata cleared" });
  } catch (err) {
    console.error("deleteImage error:", err);
    res.status(500).json({ message: "Failed to delete image" });
  }
};

// -------- STATS --------
export const getSystemStats = async (req, res) => {
  try {
    const [userCount, clothingCount] = await Promise.all([
      User.countDocuments(),
      Clothing.countDocuments(),
      // Outfit.countDocuments(),       // add these later
      // Appointment.countDocuments(),
    ]);

    // Fill in outfits/appointments later
    const stats = {
      totalUsers: userCount,
      totalClothingItems: clothingCount,
      totalOutfits: 0,
      totalAppointments: 0,
    };

    res.json(stats);
  } catch (err) {
    console.error("getSystemStats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// -------- APPOINTMENTS (stubs for now) --------
export const getAllAppointments = async (req, res) => {
  try {
    // TODO: replace when Appointment model exists
    // const appointments = await Appointment.find();
    // return res.json(appointments);
    res.status(501).json({ message: "Appointments not implemented yet" });
  } catch (err) {
    console.error("getAllAppointments error:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    // TODO: Replace with real Appointment update logic
    res.status(501).json({ message: "Appointment update not implemented yet" });
  } catch (err) {
    console.error("updateAppointment error:", err);
    res.status(500).json({ message: "Failed to update appointment" });
  }
};

// -------- EXPORTS --------
const buildCsv = (rows, headers) => {
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
};

export const exportUsersCsv = async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt");

    const rows = users.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt?.toISOString() ?? "",
    }));

    const csv = buildCsv(rows, ["name", "email", "role", "createdAt"]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(csv);
  } catch (err) {
    console.error("exportUsersCsv error:", err);
    res.status(500).json({ message: "Failed to export users" });
  }
};

export const exportClothingCsv = async (req, res) => {
  try {
    const items = await Clothing.find().lean();

    // Adjust these fields based on your Clothing schema
    const rows = items.map((item) => ({
      id: item._id.toString(),
      name: item.name || "",
      size: item.size || "",
      category: item.category || "",
      gender: item.gender || "",
    }));

    const csv = buildCsv(rows, ["id", "name", "size", "category", "gender"]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=clothing.csv");
    res.send(csv);
  } catch (err) {
    console.error("exportClothingCsv error:", err);
    res.status(500).json({ message: "Failed to export clothing" });
  }
};

export const exportOutfitsJson = async (req, res) => {
  try {
    // TODO: when Outfit model exists:
    // const outfits = await Outfit.find().lean();
    const outfits = [];
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=outfits.json");
    res.json(outfits);
  } catch (err) {
    console.error("exportOutfitsJson error:", err);
    res.status(500).json({ message: "Failed to export outfits" });
  }
};
