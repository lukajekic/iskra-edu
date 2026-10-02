import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { UserModel } from "../models/UserModel.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";

const portalRoles = ["super_admin", "district", "school_main", "school_tenant"];
const usernamePattern = /^[a-z0-9][a-z0-9._-]{2,31}$/;

const normalizeUsername = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const usernameLookup = (username) => ({ username: { $regex: `^${escapeRegex(username)}$`, $options: "i" } });
const invalidateTargetSessions = (user) => {
  if (user.type === "portal") {
    user.portal_access_data.auth_version = (user.portal_access_data.auth_version || 0) + 1;
  } else {
    user.auth_version = (user.auth_version || 0) + 1;
  }
};
const publicUser = (user, canManage = false) => ({
  id: user._id,
  name: user.name || user.username,
  username: user.username,
  type: user.type,
  role: user.portal_access_data?.role,
  active: !user.login_banned,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  institution: user.institution || null,
  schoolRef: user.schoolRef?.toString?.() || user.schoolRef || null,
  managedBy: user.portal_access_data?.managed_by?.toString?.() || user.portal_access_data?.managed_by || null,
  twoFactorEnabled: Boolean(user.portal_access_data?.otp_confirmed_at),
  canManage
});

const roleCanCreate = (managerRole, accountType) => {
  if (managerRole === "super_admin") return ["super_admin", "district", "school_main", "teacher"].includes(accountType);
  if (managerRole === "district") return ["school_tenant", "teacher"].includes(accountType);
  if (managerRole === "school_main") return accountType === "teacher";
  return false;
};

const getDescendantIds = async (managerId) => {
  const visited = new Set([managerId.toString()]);
  const descendants = [];
  let frontier = [managerId];

  while (frontier.length) {
    const children = await UserModel.find({
      type: "portal",
      "portal_access_data.managed_by": { $in: frontier }
    }).select("_id").lean();
    frontier = children.filter((child) => {
      const id = child._id.toString();
      if (visited.has(id)) return false;
      visited.add(id);
      descendants.push(child._id);
      return true;
    }).map((child) => child._id);
  }

  return descendants;
};

const getAncestorIds = async (user) => {
  const ancestors = [];
  let managerId = user.portal_access_data?.managed_by;
  const visited = new Set([user._id.toString()]);
  while (managerId && !visited.has(managerId.toString())) {
    visited.add(managerId.toString());
    ancestors.push(managerId);
    const manager = await UserModel.findOne({ _id: managerId, type: "portal" })
      .select("portal_access_data.managed_by")
      .lean();
    managerId = manager?.portal_access_data?.managed_by;
  }
  return ancestors;
};

const isRootSuperAdmin = (user, role) => role === "super_admin" && !user.portal_access_data?.managed_by;

const getManagerScope = async (user, role) => {
  let managedPortalIds = [];
  let schoolIds = [];

  if (role === "super_admin") {
    const allPortalUsers = await UserModel.find({
      type: "portal",
      "portal_access_data.role": { $in: portalRoles }
    }).select("_id portal_access_data.role").lean();
    managedPortalIds = allPortalUsers.map((portalUser) => portalUser._id);
    schoolIds = allPortalUsers
      .filter((portalUser) => ["school_main", "school_tenant"].includes(portalUser.portal_access_data?.role))
      .map((school) => school._id);
  } else if (role === "district") {
    const schools = await UserModel.find({
      type: "portal",
      "portal_access_data.role": "school_tenant",
      "portal_access_data.managed_by": user._id
    }).select("_id").lean();
    managedPortalIds = schools.map((school) => school._id);
    schoolIds = managedPortalIds;
  } else if (role === "school_main" || role === "school_tenant") {
    schoolIds = [user._id];
  }

  const teachers = schoolIds.length
    ? await UserModel.find({ type: "teacher", schoolRef: { $in: schoolIds } }).select("_id").lean()
    : [];

  return {
    managedPortalIds,
    schoolIds,
    teacherIds: teachers.map((teacher) => teacher._id)
  };
};

const getManageableUserQuery = async (manager, role, id) => {
  if (role === "super_admin") {
    if (!isRootSuperAdmin(manager, role)) {
      const protectedAncestors = await getAncestorIds(manager);
      if (protectedAncestors.some((ancestorId) => ancestorId.toString() === id.toString())) return null;
    }
    return { _id: id, type: { $in: ["portal", "teacher"] } };
  }
  const scope = await getManagerScope(manager, role);
  const manageableIds = [...scope.managedPortalIds, ...scope.teacherIds];
  if (!manageableIds.some((managedId) => managedId.toString() === id.toString())) return null;
  return { _id: id, type: { $in: ["portal", "teacher"] } };
};

export const CheckPortalUsernameAvailability = async (req, res) => {
  const username = normalizeUsername(req.query.username);
  if (!usernamePattern.test(username)) {
    return res.status(400).json(BuildValidationReturn("Invalid username.", "error", "Korisničko ime mora imati 3–32 znaka: mala slova, brojeve, tačku, crticu ili donju crtu."));
  }

  try {
    const exists = await UserModel.exists(usernameLookup(username));
    res.set("Cache-Control", "no-store");
    return res.status(200).json({ available: !exists, username });
  } catch (error) {
    console.error("Portal username availability check failed:", error);
    return res.status(500).json(BuildValidationReturn("Username check failed.", "error", "Provera korisničkog imena trenutno nije moguća."));
  }
};

export const ListPortalUsers = async (req, res) => {
  try {
    const scope = await getManagerScope(req.user, req.portalRole);
    const schoolId = typeof req.query.schoolId === "string" ? req.query.schoolId : "";
    let selectedSchool = null;
    let query;

    if (schoolId) {
      if (!mongoose.isValidObjectId(schoolId)) {
        return res.status(400).json(BuildValidationReturn("Invalid school id.", "error", "Identifikator škole nije ispravan."));
      }
      const isAllowedSchool = scope.schoolIds.some((id) => id.toString() === schoolId);
      if (!isAllowedSchool) {
        return res.status(403).json(BuildValidationReturn("School is outside your scope.", "error", "Ova škola nije u vašoj nadležnosti."));
      }
      selectedSchool = await UserModel.findOne({ _id: schoolId, type: "portal", "portal_access_data.role": { $in: ["school_main", "school_tenant"] } })
        .select("name username type portal_access_data.role")
        .lean();
      if (!selectedSchool) return res.status(404).json(BuildValidationReturn("School not found.", "error", "Škola nije pronađena."));
      query = { type: "teacher", schoolRef: selectedSchool._id };
    } else if (req.portalRole === "super_admin") {
      query = {
        $or: [
          { type: "portal", "portal_access_data.role": { $in: portalRoles } },
          { type: "teacher" }
        ]
      };
    } else if (req.portalRole === "super_admin" || req.portalRole === "district") {
      query = { _id: { $in: scope.managedPortalIds }, type: "portal" };
    } else if (req.portalRole === "school_main") {
      query = { _id: { $in: scope.teacherIds }, type: "teacher" };
    } else {
      query = {
        $or: [
          { _id: req.user._id, type: "portal" },
          { _id: { $in: scope.teacherIds }, type: "teacher" }
        ]
      };
    }

    const canManageIds = new Set((selectedSchool
      ? scope.teacherIds
      : req.portalRole === "super_admin"
        ? [...scope.managedPortalIds, ...scope.teacherIds]
        : req.portalRole === "school_main" || req.portalRole === "school_tenant"
          ? scope.teacherIds
          : scope.managedPortalIds).map((id) => id.toString()));
    const protectedAncestorIds = req.portalRole === "super_admin" && !isRootSuperAdmin(req.user, req.portalRole)
      ? new Set((await getAncestorIds(req.user)).map((id) => id.toString()))
      : new Set();
    const users = await UserModel.find(query)
      .select("name username type login_banned portal_access_data.role portal_access_data.otp_confirmed_at portal_access_data.managed_by schoolRef institution createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    const referencedSchoolIds = [...new Set(users.map((user) => user.schoolRef?.toString()).filter(Boolean))];
    const managerIds = [...new Set(users.map((user) => user.portal_access_data?.managed_by?.toString()).filter(Boolean))];
    const schools = referencedSchoolIds.length
      ? await UserModel.find({ _id: { $in: referencedSchoolIds } }).select("name username").lean()
      : [];
    const managers = managerIds.length
      ? await UserModel.find({ _id: { $in: managerIds } }).select("name username").lean()
      : [];
    const schoolNames = new Map(schools.map((school) => [school._id.toString(), school.name || school.username]));
    const managerNames = new Map(managers.map((manager) => [manager._id.toString(), manager.name || manager.username]));

    res.set("Cache-Control", "no-store");
    const canOpenSchools = new Set(scope.schoolIds.map((id) => id.toString()));
    return res.status(200).json({
      users: users.map((user) => {
        const id = user._id.toString();
        const isProtectedAncestor = protectedAncestorIds.has(id);
        const canManage = id !== req.user._id.toString()
          && !isProtectedAncestor
          && (req.portalRole === "super_admin" || canManageIds.has(id));
        const userRole = user.portal_access_data?.role;
        const canOpenSchool = user.type === "portal"
          && ["school_main", "school_tenant"].includes(userRole)
          && (isRootSuperAdmin(req.user, req.portalRole) || canOpenSchools.has(id));
        return {
          ...publicUser(user, canManage),
          schoolName: user.schoolRef ? schoolNames.get(user.schoolRef.toString()) || null : null,
          managerName: user.portal_access_data?.managed_by
            ? managerNames.get(user.portal_access_data.managed_by.toString()) || null
            : null,
          canOpenSchool
        };
      }),
      ...(selectedSchool ? { school: publicUser(selectedSchool, true) } : {})
    });
  } catch (error) {
    console.error("Portal users listing failed:", error);
    return res.status(500).json(BuildValidationReturn("User list failed.", "error", "Korisnike trenutno nije moguće učitati."));
  }
};

export const CreatePortalUser = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const username = normalizeUsername(req.body?.username);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const accountType = typeof req.body?.accountType === "string" ? req.body.accountType : "";
  let school = null;

  if (!name || name.length > 100 || !usernamePattern.test(username) || password.length < 1 || password.length > 128 || !roleCanCreate(req.portalRole, accountType)) {
    return res.status(400).json(BuildValidationReturn("Invalid portal user data.", "error", "Proverite ime, korisničko ime, ulogu i lozinku."));
  }

  try {
    if (accountType === "teacher") {
      const scope = await getManagerScope(req.user, req.portalRole);
      const schoolId = req.portalRole === "school_main" ? req.user._id.toString() : req.body?.schoolId;
      if (!mongoose.isValidObjectId(schoolId) || !scope.schoolIds.some((id) => id.toString() === schoolId.toString())) {
        return res.status(403).json(BuildValidationReturn("School is outside your scope.", "error", "Izaberite školu iz svoje nadležnosti."));
      }
      school = await UserModel.findOne({
        _id: schoolId,
        type: "portal",
        "portal_access_data.role": { $in: ["school_main", "school_tenant"] }
      }).select("name username portal_access_data.role");
      if (!school) return res.status(404).json(BuildValidationReturn("School not found.", "error", "Izabrana škola nije pronađena."));
    }

    if (await UserModel.exists(usernameLookup(username))) {
      return res.status(409).json(BuildValidationReturn("Username unavailable.", "error", "Korisničko ime je već zauzeto."));
    }

    const accountData = {
      name,
      type: accountType === "teacher" ? "teacher" : "portal",
      username,
      password: await bcrypt.hash(password, 12)
    };
    if (accountType === "teacher") {
      accountData.schoolRef = school._id;
      accountData.institution = school.name || school.username;
      accountData.activegroup = {};
    } else {
      accountData.portal_access_data = {
        role: accountType,
        managed_by: req.user._id,
        auth_version: 0
      };
    }
    const user = await UserModel.create(accountData);

    res.set("Cache-Control", "no-store");
    return res.status(201).json({ message: "Account created.", user: publicUser(user), credentials: { username, password, type: user.type, role: user.portal_access_data?.role } });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json(BuildValidationReturn("Username unavailable.", "error", "Korisničko ime je već zauzeto."));
    }
    console.error("Portal user creation failed:", error);
    return res.status(500).json(BuildValidationReturn("Portal user creation failed.", "error", "Korisnika trenutno nije moguće kreirati."));
  }
};

export const UpdatePortalUsername = async (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const query = await getManageableUserQuery(req.user, req.portalRole, req.params.id);
  if (!query) return res.status(403).json(BuildValidationReturn("Forbidden.", "error", "Nemate pravo da menjate korisničko ime."));
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json(BuildValidationReturn("Invalid user id.", "error", "Identifikator korisnika nije ispravan."));
  if (!usernamePattern.test(username)) {
    return res.status(400).json(BuildValidationReturn("Invalid username.", "error", "Korisničko ime mora imati 3–32 znaka: mala slova, brojeve, tačku, crticu ili donju crtu."));
  }

  try {
    const target = await UserModel.findOne(query);
    if (!target) return res.status(404).json(BuildValidationReturn("User not found.", "error", "Korisnik nije pronađen u vašoj nadležnosti."));
    if (target.username.toLowerCase() === username) {
      return res.status(200).json({ user: publicUser(target), unchanged: true });
    }
    if (await UserModel.exists(usernameLookup(username))) {
      return res.status(409).json(BuildValidationReturn("Username unavailable.", "error", "Korisničko ime je već zauzeto."));
    }

    target.username = username;
    invalidateTargetSessions(target);
    await target.save();
    res.set("Cache-Control", "no-store");
    return res.status(200).json({ user: publicUser(target) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json(BuildValidationReturn("Username unavailable.", "error", "Korisničko ime je već zauzeto."));
    }
    console.error("Portal username update failed:", error);
    return res.status(500).json(BuildValidationReturn("Username update failed.", "error", "Korisničko ime trenutno nije moguće promeniti."));
  }
};

export const ResetPortalPassword = async (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const query = await getManageableUserQuery(req.user, req.portalRole, req.params.id);
  if (!query) return res.status(403).json(BuildValidationReturn("Forbidden.", "error", "Nemate pravo da resetujete lozinku."));
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json(BuildValidationReturn("Invalid user id.", "error", "Identifikator korisnika nije ispravan."));
  if (password.length < 1 || password.length > 128) {
    return res.status(400).json(BuildValidationReturn("Invalid password.", "error", "Unesite lozinku do 128 znakova."));
  }

  try {
    const target = await UserModel.findOne(query);
    if (!target) return res.status(404).json(BuildValidationReturn("User not found.", "error", "Korisnik nije pronađen u vašoj nadležnosti."));
    target.password = await bcrypt.hash(password, 12);
    invalidateTargetSessions(target);
    await target.save();

    res.set("Cache-Control", "no-store");
    return res.status(200).json({ user: publicUser(target), credentials: { username: target.username, password, type: target.type, role: target.portal_access_data?.role } });
  } catch (error) {
    console.error("Portal password reset failed:", error);
    return res.status(500).json(BuildValidationReturn("Password reset failed.", "error", "Lozinku trenutno nije moguće resetovati."));
  }
};

export const RevokePortalTwoFactor = async (req, res) => {
  const query = await getManageableUserQuery(req.user, req.portalRole, req.params.id);
  if (!query) return res.status(403).json(BuildValidationReturn("Forbidden.", "error", "Nemate pravo da opozovete 2FA."));
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json(BuildValidationReturn("Invalid user id.", "error", "Identifikator korisnika nije ispravan."));

  try {
    const target = await UserModel.findOne(query);
    if (!target) return res.status(404).json(BuildValidationReturn("User not found.", "error", "Korisnik nije pronađen u vašoj nadležnosti."));
    if (target.type !== "portal") return res.status(400).json(BuildValidationReturn("Two-factor authentication unavailable.", "error", "Običnim nastavničkim nalozima nije potrebna 2FA."));

    await UserModel.updateOne(query, {
      $unset: {
        "portal_access_data.otp_secret": 1,
        "portal_access_data.otp_setup_started_at": 1,
        "portal_access_data.otp_confirmed_at": 1,
        "portal_access_data.otp_last_used_counter": 1
      },
      $inc: { "portal_access_data.auth_version": 1 }
    });

    res.set("Cache-Control", "no-store");
    return res.status(200).json({ message: "Two-factor authentication revoked." });
  } catch (error) {
    console.error("Portal 2FA revocation failed:", error);
    return res.status(500).json(BuildValidationReturn("Two-factor revocation failed.", "error", "2FA trenutno nije moguće opozvati."));
  }
};

export const SetPortalUserAccess = async (req, res) => {
  const query = await getManageableUserQuery(req.user, req.portalRole, req.params.id);
  const active = req.body?.active;
  if (!query) return res.status(403).json(BuildValidationReturn("Forbidden.", "error", "Nemate pravo da menjate pristup ovom nalogu."));
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json(BuildValidationReturn("Invalid user id.", "error", "Identifikator korisnika nije ispravan."));
  if (typeof active !== "boolean") return res.status(400).json(BuildValidationReturn("Invalid account status.", "error", "Status naloga nije ispravan."));

  try {
    const updatedUser = await UserModel.findOne(query);
    if (!updatedUser) return res.status(404).json(BuildValidationReturn("User not found.", "error", "Korisnik nije pronađen u vašoj nadležnosti."));
    updatedUser.login_banned = !active;
    invalidateTargetSessions(updatedUser);
    await updatedUser.save();

    res.set("Cache-Control", "no-store");
    return res.status(200).json({ user: publicUser(updatedUser, true) });
  } catch (error) {
    console.error("Portal account access update failed:", error);
    return res.status(500).json(BuildValidationReturn("Account access update failed.", "error", "Pristup nalogu trenutno nije moguće promeniti."));
  }
};
