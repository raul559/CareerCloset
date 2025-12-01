/**
 * Appointment Model
 * Developed with AI assistance
 * 
 * AI assisted with: Schema design, index optimization, virtual properties,
 * static methods for slot availability, and status enum definitions.
 */

import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    time: {
      type: String, // Format: HH:MM (24-hour)
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "blocked", "denied"],
      default: "pending",
      index: true,
    },
    appointmentType: {
      type: String,
      enum: ["consultation"],
      default: "consultation",
    },
    studentId: {
      type: String,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
      default: 45,
    },
    requestedItems: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        color: String,
        size: String,
        status: {
          type: String,
          enum: ["reserved", "approved", "rejected", "picked_up", "returned"],
          default: "reserved",
        },
        notes: String, // Admin can add notes like "doesn't fit, try size up"
      },
    ],
    isAdminBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for checking availability
appointmentSchema.index({ date: 1, time: 1 });

// Index for querying user appointments
appointmentSchema.index({ userId: 1, date: 1 });

// Index for admin queries
appointmentSchema.index({ status: 1, date: 1 });

// Virtual for full datetime
appointmentSchema.virtual("datetime").get(function () {
  return `${this.date} ${this.time}`;
});

// Method to check if appointment is in the past
appointmentSchema.methods.isPast = function () {
  const appointmentDate = new Date(`${this.date}T${this.time}:00`);
  return appointmentDate < new Date();
};

// Static method to find available slots
appointmentSchema.statics.findAvailableSlots = async function (date) {
  const bookedSlots = await this.find({
    date,
    status: { $in: ["pending", "confirmed", "blocked"] },
  }).select("time duration");
  return bookedSlots;
};

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
