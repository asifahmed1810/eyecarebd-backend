import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["patient", "user", "doctor", "admin"], default: "user" },
    specialty: { type: String, trim: true },
    hospital: { type: String, trim: true },
    location: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    reviews: { type: Number, min: 0, default: 0 },
    available: { type: String, trim: true, default: "Available" },
  },
  { timestamps: true },
);

UserSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

