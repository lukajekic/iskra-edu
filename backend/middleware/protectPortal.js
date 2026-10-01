import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";

const portalRoles = new Set(["super_admin", "district", "school_main", "school_tenant"]);

export const protectPortal = async (req, res, next) => {
  try {
    const token = req.cookies?.portal_token || req.cookies?.token;
    if (!token) {
      return res.status(401).json(BuildValidationReturn("Portal authentication required.", "error", "Prijavite se na portal."));
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.scope !== "portal" || verified.mfa !== "totp") {
      return res.status(401).json(BuildValidationReturn("Invalid portal session.", "error", "Prijavite se na portal."));
    }

    const user = verified.username
      ? await UserModel.findOne({ username: verified.username })
      : await UserModel.findById(verified.id);
    const role = user?.portal_access_data?.role;
    if (!user) {
      return res.status(403).json(BuildValidationReturn("Portal account not found.", "error", "Portal nalog iz sesije nije pronađen."));
    }
    if (user.type !== "portal") {
      return res.status(403).json(BuildValidationReturn("Not a portal account.", "error", "Ovaj nalog nije portal nalog."));
    }
    if (!portalRoles.has(role)) {
      return res.status(403).json(BuildValidationReturn("Invalid portal role.", "error", "Portal nalog nema važeću portal ulogu."));
    }
    if (user.login_banned) {
      return res.status(403).json(BuildValidationReturn("Portal account is banned.", "error", "Portal nalog ima zabranu prijave."));
    }

    req.user = user;
    req.portalRole = role;
    return next();
  } catch {
    return res.status(401).json(BuildValidationReturn("Invalid portal session.", "error", "Prijavite se na portal."));
  }
};
