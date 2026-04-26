import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    doctorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Doctor", 
      required: true,
      index: true 
    },
    date: { 
      type: Date, 
      required: true,
      index: true 
    },
    time: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["consultation", "followup", "screening", "emergency"], 
      default: "consultation" 
    },
    reason: { 
      type: String, 
      trim: true 
    },
    location: { 
      type: String, 
      trim: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "completed", "cancelled"], 
      default: "pending" 
    },
    notes: { 
      type: String 
    },
    contactPhone: { 
      type: String, 
      trim: true 
    },
    contactEmail: { 
      type: String, 
      trim: true,
      lowercase: true 
    },
  },
  { timestamps: true },
);

export const Appointment = mongoose.models.Appointment ?? mongoose.model("Appointment", AppointmentSchema);
