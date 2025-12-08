import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  getAllUsers,
  updateUserRole,
  promoteUser,
  demoteUser,
  deleteUser,
  getAllClothing,
  updateClothingItem,
  deleteClothingItem,
  updateImageMetadata,
  deleteImage,
  getSystemStats,
  getAllAppointments,
  updateAppointment,
  exportUsersCsv,
  exportClothingCsv,
  exportOutfitsJson,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes below require admin
router.use(adminAuth);

// ----- Users -----
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.patch("/users/:id/promote", promoteUser);
router.patch("/users/:id/demote", demoteUser);
router.delete("/users/:id", deleteUser);

// ----- Clothing -----
router.get("/clothing", getAllClothing);
router.put("/clothing/:id", updateClothingItem);
router.delete("/clothing/:id", deleteClothingItem);

// ----- Clothing Image Management (admin) -----
// Update image metadata for a clothing item
router.put("/clothing/:id/image", updateImageMetadata);
// Delete image for a clothing item (clears DB fields and removes object from GCS)
router.delete("/clothing/:id/image", deleteImage);

// ----- Images (admin) -----
router.put("/images/:id", updateImageMetadata);
router.delete("/images/:id", deleteImage);

// ----- Stats -----
router.get("/stats", getSystemStats);

// ----- Appointments -----
router.get("/appointments", getAllAppointments);
router.put("/appointments/:id", updateAppointment);

// ----- Export -----
router.get("/export/users/csv", exportUsersCsv);
router.get("/export/clothing/csv", exportClothingCsv);
router.get("/export/outfits/json", exportOutfitsJson);

export default router;
