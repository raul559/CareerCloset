import User from "../models/User.js";
import Clothing from "../models/ClothingItem.js"; 
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
    res.json(items);
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

    const deleted = await Clothing.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    res.json({ message: "Clothing item deleted successfully" });
  } catch (err) {
    console.error("deleteClothingItem error:", err);
    res.status(500).json({ message: "Failed to delete clothing item" });
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
