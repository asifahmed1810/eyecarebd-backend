import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { httpError } from "../utils/httpError.js";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next(httpError(401, "Missing token"));

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return next(httpError(401, "Invalid token"));
  }
}

