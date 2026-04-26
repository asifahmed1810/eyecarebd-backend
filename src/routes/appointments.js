import { Router } from "express";
import { z } from "zod";
import { Appointment } from "../models/Appointment.js";
import { requireAuth } from "../middleware/auth.js";
import { httpError } from "../utils/httpError.js";
import { Doctor } from "../models/Doctor.js";

export const appointmentsRouter = Router();

appointmentsRouter.use(requireAuth);

const CreateAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  date: z.string().datetime("Invalid date format"),
  time: z.string().min(1, "Time is required"),
  type: z.enum(["consultation", "followup", "screening", "emergency"]).optional(),
  reason: z.string().max(500).optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

appointmentsRouter.post("/", async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    const role = req.auth?.role;
    if (!userId || role !== "patient") {
      throw httpError(403, "Only patients can create appointments");
    }

    const data = CreateAppointmentSchema.parse(req.body);

    const doctor = await Doctor.findById(data.doctorId).populate("userId", "name email").lean();
    if (!doctor) {
      throw httpError(404, "Doctor not found");
    }

    const appointment = await Appointment.create({
      patientId: userId,
      doctorId: data.doctorId,
      date: new Date(data.date),
      time: data.time,
      type: data.type ?? "consultation",
      reason: data.reason,
      location: doctor.hospital || doctor.location,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail || (doctor.userId?.email ?? undefined),
      status: "pending",
    });

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      })
      .lean();

    res.status(201).json({ appointment: populated });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.get("/my-appointments", async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) throw httpError(401, "Unauthorized");

    const appointments = await Appointment.find({ patientId: userId })
      .populate({
        path: "doctorId",
        select: "specialty hospital location available rating reviews",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ date: -1 })
      .lean();

    res.json({ appointments });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.get("/doctor-schedule", async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    const role = req.auth?.role;
    if (!userId || role !== "doctor") {
      throw httpError(403, "Only doctors can view their schedule");
    }

    const doctor = await Doctor.findOne({ userId }).lean();
    if (!doctor) throw httpError(404, "Doctor profile not found");

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "name email")
      .sort({ date: 1 })
      .lean();

    res.json({ appointments });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    const role = req.auth?.role;
    if (!userId) throw httpError(401, "Unauthorized");

    const doctor = role === "doctor" ? await Doctor.findOne({ userId }).lean() : null;
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email")
      .populate({
        path: "doctorId",
        select: "specialty hospital location",
        populate: { path: "userId", select: "name email" },
      })
      .lean();

    if (!appointment) {
      throw httpError(404, "Appointment not found");
    }

    if (
      appointment.patientId._id.toString() !== userId &&
      String(appointment.doctorId._id) !== String(doctor?._id) &&
      role !== "admin"
    ) {
      throw httpError(403, "Unauthorized");
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

const UpdateAppointmentSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
});

appointmentsRouter.patch("/:id", async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    const role = req.auth?.role;
    if (!userId) throw httpError(401, "Unauthorized");

    const doctor = role === "doctor" ? await Doctor.findOne({ userId }).lean() : null;
    const appointment = await Appointment.findById(req.params.id).lean();

    if (!appointment) {
      throw httpError(404, "Appointment not found");
    }

    if (
      String(appointment.doctorId) !== String(doctor?._id) &&
      role !== "admin"
    ) {
      throw httpError(403, "Unauthorized");
    }

    const data = UpdateAppointmentSchema.parse(req.body);
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate("patientId", "name email")
      .populate({
        path: "doctorId",
        select: "specialty hospital location",
        populate: { path: "userId", select: "name email" },
      })
      .lean();

    res.json({ appointment: updated });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.post("/:id/cancel", async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    const role = req.auth?.role;
    if (!userId) throw httpError(401, "Unauthorized");

    const doctor = role === "doctor" ? await Doctor.findOne({ userId }).lean() : null;
    const appointment = await Appointment.findById(req.params.id).lean();

    if (!appointment) {
      throw httpError(404, "Appointment not found");
    }

    if (
      appointment.patientId.toString() !== userId &&
      String(appointment.doctorId) !== String(doctor?._id) &&
      role !== "admin"
    ) {
      throw httpError(403, "Unauthorized");
    }

    // Patients can only cancel at least 1 day before appointment time
    if (appointment.patientId.toString() === userId) {
      const oneDayMs = 24 * 60 * 60 * 1000;
      const appointmentTime = new Date(appointment.date).getTime();
      if (appointmentTime - Date.now() < oneDayMs) {
        throw httpError(400, "Appointments can only be cancelled at least 1 day before scheduled date");
      }
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "cancelled" } },
      { new: true, runValidators: true },
    )
      .populate("patientId", "name email")
      .populate({
        path: "doctorId",
        select: "specialty hospital location",
        populate: { path: "userId", select: "name email" },
      })
      .lean();

    res.json({ appointment: updated });
  } catch (err) {
    next(err);
  }
});
