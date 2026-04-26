import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { httpError } from "../utils/httpError.js";

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAuth, requireRole("admin"));

adminUsersRouter.get("/", async (req, res, next) => {
  try {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const filter = role ? { role } : {};

    const users = await User.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

adminUsersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) throw httpError(404, "User not found");
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["patient", "doctor", "admin"]).optional(),
  specialty: z.string().min(2).max(120).optional(),
  hospital: z.string().min(2).max(160).optional(),
  location: z.string().min(2).max(160).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  available: z.string().min(2).max(80).optional(),
});

adminUsersRouter.patch("/:id", async (req, res, next) => {
  try {
    const update = UpdateUserSchema.parse(req.body);

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) throw httpError(404, "User not found");
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

adminUsersRouter.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id).lean();
    if (!deleted) throw httpError(404, "User not found");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

