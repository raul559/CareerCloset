// AI-Assisted Code Notice:
// Core appointment CRUD logic, conflict detection algorithms
// functionality were developed with AI assistance for code structure and optimization.

import Appointment from "../models/Appointment.js";

/**
 * Helper function to check if items are available for a given date
 * Returns array of conflicting items with details about who has them reserved
 */
async function checkItemAvailability(requestedItems, appointmentDate, excludeAppointmentId = null) {
  if (!requestedItems || requestedItems.length === 0) {
    return { available: true, conflicts: [] };
  }

  const itemIds = requestedItems.map(item => item.id);
  
  // Find appointments on the same date with overlapping items
  const filter = {
    date: appointmentDate,
    status: { $in: ["pending", "confirmed"] },
    "requestedItems.id": { $in: itemIds },
  };
  
  if (excludeAppointmentId) {
    filter._id = { $ne: excludeAppointmentId };
  }

  const conflictingAppointments = await Appointment.find(filter);
  
  const conflicts = [];
  for (const appointment of conflictingAppointments) {
    for (const requestedItem of requestedItems) {
      const hasItem = appointment.requestedItems.some(item => item.id === requestedItem.id);
      if (hasItem) {
        conflicts.push({
          itemId: requestedItem.id,
          itemName: requestedItem.name,
          reservedBy: appointment.userName,
          reservedByEmail: appointment.userEmail,
          appointmentId: appointment._id,
          appointmentTime: appointment.time,
        });
      }
    }
  }

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Get all appointments (with optional filters)
 */
export async function getAllAppointments(req, res) {
  try {
    const { userId, status, date, startDate, endDate } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (date) filter.date = date;
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch appointments",
    });
  }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch appointment",
    });
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(req, res) {
  try {
    const {
      userId,
      userName,
      userEmail,
      date,
      time,
      studentId,
      major,
      notes,
      duration = 45,
      requestedItems = [],
    } = req.body;

    // Validate required fields
    if (!userId || !userName || !userEmail || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, userName, userEmail, date, time",
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      date,
      time,
      status: { $in: ["pending", "confirmed", "blocked"] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        error: "This time slot is already booked",
      });
    }

    // Check if requested items are available (optional - you can remove this if you want to allow conflicts)
    // This allows multiple people to request same item - admin will decide during approval
    const itemCheck = await checkItemAvailability(requestedItems, date);
    if (!itemCheck.available) {
      // WARNING: Item conflicts exist but we'll allow booking anyway
      // Admin can handle conflicts during approval process
      console.warn(`Item conflicts detected for appointment on ${date}:`, itemCheck.conflicts);
    }

    const appointment = new Appointment({
      userId,
      userName,
      userEmail,
      date,
      time,
      studentId,
      major,
      notes,
      duration,
      requestedItems: requestedItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        color: item.color || "",
        size: item.size || "",
        status: "reserved",
      })),
      appointmentType: "consultation",
      status: "pending",
      createdBy: userId,
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create appointment",
    });
  }
}

/**
 * Update an appointment
 */
export async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating these fields via this endpoint
    delete updates._id;
    delete updates.createdBy;
    delete updates.createdAt;

    // Add updatedBy field
    if (updates.userId) {
      updates.updatedBy = updates.userId;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update appointment",
    });
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    appointment.status = "cancelled";
    if (userId) appointment.updatedBy = userId;
    await appointment.save();

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to cancel appointment",
    });
  }
}

/**
 * Delete an appointment (admin only)
 */
export async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete appointment",
    });
  }
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date parameter is required",
      });
    }

    // Check if date is a weekday (Monday-Friday)
    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay();
    
    // Return empty slots for weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json({
        success: true,
        data: {
          date,
          availableSlots: [],
          bookedSlots: [],
        }
      });
    }

    const bookedSlots = await Appointment.findAvailableSlots(date);

    // Define available hours 9 AM - 5 PM Monday-Friday (30 min slots)
    const businessHours = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    const bookedTimes = bookedSlots.map(slot => slot.time);
    const availableSlots = businessHours.filter(time => !bookedTimes.includes(time));

    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        bookedSlots: bookedTimes,
      }
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch available slots",
    });
  }
}

/**
 * Admin: Block a time slot or entire day
 */
export async function blockTimeSlot(req, res) {
  try {
    const { date, time, blockEntireDay, blockTimeRange, timeFrom, timeTo, duration = 60, reason } = req.body;
    const adminId = req.body.adminId || "admin";

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required",
      });
    }

    const allSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    if (blockEntireDay) {
      const blockedSlots = allSlots.map(slot => ({
        userId: adminId,
        userName: "Admin Block - Entire Day",
        userEmail: adminId,
        date,
        time: slot,
        duration: 30,
        reason,
        status: "blocked",
        appointmentType: "consultation",
        isAdminBlocked: true,
        createdBy: adminId,
      }));

      await Appointment.insertMany(blockedSlots);

      return res.status(201).json({
        success: true,
        message: `Blocked entire day: ${date}`,
        data: blockedSlots,
      });
    }

    if (blockTimeRange) {
      if (!timeFrom || !timeTo) {
        return res.status(400).json({
          success: false,
          error: "timeFrom and timeTo are required for time range blocking",
        });
      }

      const fromIndex = allSlots.indexOf(timeFrom);
      const toIndex = allSlots.indexOf(timeTo);

      if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
        return res.status(400).json({
          success: false,
          error: "Invalid time range",
        });
      }

      const slotsToBlock = allSlots.slice(fromIndex, toIndex + 1);
      const blockedSlots = slotsToBlock.map(slot => ({
        userId: adminId,
        userName: `Admin Block - ${timeFrom} to ${timeTo}`,
        userEmail: adminId,
        date,
        time: slot,
        duration: 30,
        reason,
        status: "blocked",
        appointmentType: "consultation",
        isAdminBlocked: true,
        createdBy: adminId,
      }));

      await Appointment.insertMany(blockedSlots);

      return res.status(201).json({
        success: true,
        message: `Blocked time range: ${timeFrom} to ${timeTo} on ${date}`,
        data: blockedSlots,
      });
    }

    if (!time) {
      return res.status(400).json({
        success: false,
        error: "Time is required when not blocking entire day or time range",
      });
    }

    const blockedSlot = new Appointment({
      userId: adminId,
      userName: "Admin Block",
      userEmail: adminId,
      date,
      time,
      duration,
      reason,
      status: "blocked",
      appointmentType: "consultation",
      isAdminBlocked: true,
      createdBy: adminId,
    });

    await blockedSlot.save();

    res.status(201).json({
      success: true,
      data: blockedSlot,
    });
  } catch (error) {
    console.error("Error blocking time slot:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to block time slot",
    });
  }
}

/**
 * Get fully blocked dates (all slots blocked)
 */
export async function getBlockedDates(req, res) {
  try {
    const allSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    const blockedAppointments = await Appointment.aggregate([
      {
        $match: {
          status: "blocked",
          date: { $gte: new Date().toISOString().split('T')[0] }
        }
      },
      {
        $group: {
          _id: "$date",
          blockedSlots: { $push: "$time" }
        }
      }
    ]);

    const fullyBlockedDates = blockedAppointments
      .filter(day => day.blockedSlots.length === allSlots.length)
      .map(day => day._id);

    res.json({
      success: true,
      data: fullyBlockedDates,
    });
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch blocked dates",
    });
  }
}

/**
 * Unblock an entire day
 */
export async function unblockDay(req, res) {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required",
      });
    }

    const result = await Appointment.deleteMany({
      date,
      status: "blocked"
    });

    res.json({
      success: true,
      message: `Unblocked ${result.deletedCount} slots on ${date}`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error unblocking day:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to unblock day",
    });
  }
}

/**
 * Check item availability for a specific date
 * Useful for admins to see which items are in high demand
 */
export async function checkItemConflicts(req, res) {
  try {
    const { date, itemIds } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required",
      });
    }

    const items = itemIds ? itemIds.split(',') : [];
    
    // Get all appointments on this date with requested items
    const appointments = await Appointment.find({
      date,
      status: { $in: ["pending", "confirmed"] },
      "requestedItems.0": { $exists: true }, // Has at least one item
    }).select("userName userEmail time requestedItems status");

    // Build item conflict map
    const itemConflicts = {};
    
    appointments.forEach(appointment => {
      appointment.requestedItems.forEach(item => {
        if (items.length === 0 || items.includes(item.id)) {
          if (!itemConflicts[item.id]) {
            itemConflicts[item.id] = {
              itemId: item.id,
              itemName: item.name,
              category: item.category,
              size: item.size,
              requestedBy: [],
            };
          }
          itemConflicts[item.id].requestedBy.push({
            userName: appointment.userName,
            userEmail: appointment.userEmail,
            appointmentTime: appointment.time,
            appointmentStatus: appointment.status,
            itemStatus: item.status,
          });
        }
      });
    });

    // Find items with conflicts (multiple people requesting same item)
    const conflicts = Object.values(itemConflicts).filter(item => item.requestedBy.length > 1);

    res.json({
      success: true,
      date,
      totalItems: Object.keys(itemConflicts).length,
      conflictCount: conflicts.length,
      conflicts,
      allItems: itemConflicts,
    });
  } catch (error) {
    console.error("Error checking item conflicts:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check item conflicts",
    });
  }
}
