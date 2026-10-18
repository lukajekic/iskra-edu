import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { logEvent } from "../utilities/eventLogger.js";
import { UserSessionModel } from "../models/UserSessionModel.js";
import { createUserSession } from "../utilities/userSessions.js";

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
      req.user = user;
      logEvent({ category: "auth", type: "auth.portal_session_blocked", severity: "warning", outcome: "blocked", details: { reason: "account_banned" }, dedupe: true }, req);
      return res.status(403).json(BuildValidationReturn("Portal account is banned.", "error", "Portal nalog ima zabranu prijave."));
    }
    if ((verified.authVersion || 0) !== (user.portal_access_data?.auth_version || 0)) {
      req.user = user;
      logEvent({ category: "auth", type: "auth.portal_session_blocked", severity: "warning", outcome: "blocked", details: { reason: "session_revoked" }, dedupe: true }, req);
      return res.status(401).json(BuildValidationReturn("Portal session revoked.", "error", "Portal sesija je opozvana. Prijavite se ponovo."));
    }

    if (verified.sessionId) {
      const session = await UserSessionModel.exists({
        _id: verified.sessionId,
        userRef: user._id,
        scope: "portal",
        authVersion: user.portal_access_data?.auth_version || 0,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      });
      if (!session) {
        req.user = user;
        logEvent({ category: "auth", type: "auth.portal_session_blocked", severity: "warning", outcome: "blocked", details: { reason: "device_session_revoked" }, dedupe: true }, req);
        return res.status(401).json(BuildValidationReturn("Portal session revoked.", "error", "Ova sesija je odjavljena. Prijavite se ponovo."));
      }
      req.sessionId = verified.sessionId;
    } else if (verified.exp) {
      const remainingSeconds = Math.max(1, verified.exp - Math.floor(Date.now() / 1000));
      const session = await createUserSession({
        user,
        scope: "portal",
        req,
        lifetimeSeconds: remainingSeconds,
        createdAt: verified.iat ? new Date(verified.iat * 1000) : new Date(),
        expiresAt: new Date(verified.exp * 1000),
      });
      req.sessionId = String(session._id);
      const secureCookie = req.secure
        || req.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https"
        || process.env.NODE_ENV === "production";
      const upgradedToken = jwt.sign({
        id: user._id.toString(),
        username: user.username,
        scope: "portal",
        mfa: "totp",
        authVersion: user.portal_access_data?.auth_version || 0,
        sessionId: req.sessionId,
      }, process.env.JWT_SECRET, { expiresIn: remainingSeconds });
      res.cookie("portal_token", upgradedToken, {
        maxAge: remainingSeconds * 1000,
        secure: secureCookie,
        httpOnly: true,
        sameSite: secureCookie ? "none" : "lax",
      });
    }

    req.user = user;
    req.portalRole = role;
    return next();
  } catch {
    logEvent({ category: "auth", type: "auth.portal_token_invalid", severity: "warning", outcome: "blocked", details: { reason: "token_verification_failed" }, dedupe: true }, req);
    return res.status(401).json(BuildValidationReturn("Invalid portal session.", "error", "Prijavite se na portal."));
  }
};
