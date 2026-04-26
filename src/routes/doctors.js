import { Router } from "express";
import { Doctor } from "../models/Doctor.js";
import { httpError } from "../utils/httpError.js";

export const doctorsRouter = Router();

doctorsRouter.get("/", async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate("userId", "name email")
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    const normalized = doctors.map((d) => ({
      _id: String(d._id),
      userId: String(d.userId?._id ?? ""),
      name: d.userId?.name ?? "Doctor",
      email: d.userId?.email ?? "",
      specialty: d.specialty,
      hospital: d.hospital,
      location: d.location,
      rating: d.rating,
      reviews: d.reviews,
      available: d.available,
    }));

    res.json({ doctors: normalized });
  } catch (err) {
    next(err);
  }
});

doctorsRouter.get("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("userId", "name email")
      .lean();
    if (!doctor) {
      throw httpError(404, "Doctor not found");
    }
    res.json({
      doctor: {
        _id: String(doctor._id),
        userId: String(doctor.userId?._id ?? ""),
        name: doctor.userId?.name ?? "Doctor",
        email: doctor.userId?.email ?? "",
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        location: doctor.location,
        rating: doctor.rating,
        reviews: doctor.reviews,
        available: doctor.available,
      },
    });
  } catch (err) {
    next(err);
  }
});
