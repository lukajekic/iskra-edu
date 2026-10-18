import { UserSessionModel } from "../models/UserSessionModel.js";

export async function createUserSession({ user, scope = "standard", req, lifetimeSeconds, createdAt, expiresAt: requestedExpiry }) {
  const now = new Date();
  const sessionCreatedAt = createdAt || now;
  const expiresAt = requestedExpiry || new Date(now.getTime() + Math.max(1, lifetimeSeconds) * 1000);
  const session = await UserSessionModel.create({
    userRef: user._id,
    scope,
    authVersion: scope === "portal"
      ? (user.portal_access_data?.auth_version || 0)
      : (user.auth_version || 0),
    userAgent: String(req.get("user-agent") || "Nepoznat uređaj").slice(0, 300),
    createdAt: sessionCreatedAt,
    expiresAt,
  });
  return session;
}

export function formatSession(session, currentSessionId) {
  const userAgent = session.userAgent || "";
  const browser = /Edg\//i.test(userAgent) ? "Microsoft Edge"
    : /OPR\//i.test(userAgent) ? "Opera"
      : /Firefox\//i.test(userAgent) ? "Firefox"
        : /Chrome\//i.test(userAgent) ? "Google Chrome"
          : /Safari\//i.test(userAgent) ? "Safari" : "Pregledač";
  const platform = /Windows/i.test(userAgent) ? "Windows"
    : /Android/i.test(userAgent) ? "Android"
      : /iPhone|iPad|iPod/i.test(userAgent) ? "iOS/iPadOS"
        : /Mac OS/i.test(userAgent) ? "macOS"
          : /Linux/i.test(userAgent) ? "Linux" : "uređaj";
  return {
    id: String(session._id),
    device: `${browser} · ${platform}`,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    current: String(session._id) === String(currentSessionId || ""),
  };
}
