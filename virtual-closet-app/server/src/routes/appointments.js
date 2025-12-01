import express from "express";
import * as appointmentController from "../controllers/appointmentController.js";

const router = express.Router();

// Get all appointments (with optional filters)
router.get("/", appointmentController.getAllAppointments);

// Get available time slots for a specific date
router.get("/available-slots", appointmentController.getAvailableSlots);

// Get fully blocked dates
router.get("/blocked-dates", appointmentController.getBlockedDates);

// Get a single appointment by ID
router.get("/:id", appointmentController.getAppointmentById);

// Create a new appointment
router.post("/", appointmentController.createAppointment);

// Update an appointment
router.put("/:id", appointmentController.updateAppointment);

// Cancel an appointment
router.patch("/:id/cancel", appointmentController.cancelAppointment);

// Delete an appointment (admin only)
router.delete("/:id", appointmentController.deleteAppointment);

// Admin: Block a time slot
router.post("/block", appointmentController.blockTimeSlot);

// Unblock an entire day
router.post("/unblock-day", appointmentController.unblockDay);

// Check item conflicts for a date
router.get("/item-conflicts", appointmentController.checkItemConflicts);

export default router;
