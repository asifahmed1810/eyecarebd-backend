import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";
import { Doctor } from "../models/Doctor.js";

export const authRouter = Router();

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  role: z.enum(["patient", "doctor", "admin"]).optional(),
  specialty: z.string().min(2).max(120).optional(),
  hospital: z.string().min(2).max(160).optional(),
  location: z.string().min(2).max(160).optional(),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email }).lean();
    if (existing) throw httpError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role ?? "patient",
    });

    if (user.role === "doctor") {
      await Doctor.create({
        userId: user._id,
        specialty: data.specialty ?? "General Ophthalmology",
        hospital: data.hospital ?? "EyeCareBD Medical Center",
        location: data.location ?? "Dhaka",
      });
    }

    res.status(201).json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email }).select("+passwordHash");
    if (!user) throw httpError(401, "Invalid email or password");

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw httpError(401, "Invalid email or password");

    const token = jwt.sign(
      { sub: String(user._id), role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN },
    );

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
});

