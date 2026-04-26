import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    specialty: { type: String, trim: true, required: true },
    hospital: { type: String, trim: true, required: true },
    location: { type: String, trim: true, required: true },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    reviews: { type: Number, min: 0, default: 0 },
    available: { type: String, trim: true, default: "Available" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Doctor = mongoose.models.Doctor ?? mongoose.model("Doctor", DoctorSchema);

