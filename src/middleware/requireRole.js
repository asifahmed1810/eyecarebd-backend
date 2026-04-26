import { httpError } from "../utils/httpError.js";

export function requireRole(...roles) {
  return (req, _res, next) => {
    const role = req.auth?.role;
    if (!role) return next(httpError(401, "Missing auth context"));
    if (!roles.includes(role)) return next(httpError(403, "Forbidden"));
    return next();
  };
}

