import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllClothing,
  updateClothingItem,
  deleteClothingItem,
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
router.delete("/users/:id", deleteUser);

// ----- Clothing -----
router.get("/clothing", getAllClothing);
router.put("/clothing/:id", updateClothingItem);
router.delete("/clothing/:id", deleteClothingItem);

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
