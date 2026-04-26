import  { Router } from "express";
import { TestResult } from "../models/TestResult.js";
import { requireAuth } from "../middleware/auth.js";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js";
import { httpError } from "../utils/httpError.js";

export const testrouter = Router();
testrouter.use(requireAuth);

testrouter.post("/", async (req, res) => {
  try {
    const { testType, score, result } = req.body;
    const userId = req.auth?.sub;
    if (!userId) throw httpError(401, "Unauthorized");

    const data = await TestResult.create({
      userId,
      testType,
      score,
      result,
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

testrouter.get("/me", async (req, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) throw httpError(401, "Unauthorized");

    const data = await TestResult.find({
      userId,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// doctor can view test results of patients who booked with them
testrouter.get("/patients/:patientId", async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const role = req.auth?.role;
    if (!userId || role !== "doctor") throw httpError(403, "Doctor access required");

    const doctor = await Doctor.findOne({ userId }).lean();
    if (!doctor) throw httpError(404, "Doctor profile not found");

    const hasAppointment = await Appointment.findOne({
      doctorId: doctor._id,
      patientId: req.params.patientId,
    }).lean();
    if (!hasAppointment) throw httpError(403, "No appointment with this patient");

    const data = await TestResult.find({
      userId: req.params.patientId,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

