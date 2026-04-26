import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) throw httpError(401, "Invalid token payload");

    const user = await User.findById(userId).lean();
    if (!user) throw httpError(404, "User not found");

    // Remove sensitive fields (passwordHash is select:false but keep safe)
    const { passwordHash, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    next(err);
  }
});

