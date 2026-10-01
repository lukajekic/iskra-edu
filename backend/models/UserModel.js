import mongoose from "mongoose";

const activeGroupSchema = new mongoose.Schema({
  expiry: { type: Date, required: false },
  code: { type: String, required: false },
  work_forbidden: { type: Boolean, default: false }
}, { _id: false });

const solutionSchema = new mongoose.Schema({
  solutionID: { type: String, required: false },
  status: { type: String, required: false },
  code: { type: String, required: false },
  stderr: { type: String, required: false },
  stdok: { type: String, required: false },
  taskID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: false
  },
  dev_ocekivani_output: { type: String, required: false },
  dev_output: { type: String, required: false },
  grading_date: { type: Date, required: false },
  flags: { type: Array, required: false }
}, { _id: false });

const portalAccessDataSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["super_admin", "district", "school_main", "school_tenant"],
    required: false
  },
  otp_secret: { type: String, required: false, select: false },
  otp_setup_started_at: { type: Date, required: false },
  otp_confirmed_at: { type: Date, required: false },
  otp_last_used_counter: { type: Number, required: false }
}, { _id: false });

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },

  type: {
    type: String,
    enum: ["student", "student_permanent", "student_temp", "teacher", "admin", "user", "portal"],
    default: "user",
    required: false
  },

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  login_banned: {
    type: Boolean,
    default: false
  },

  activegroup: {
    type: activeGroupSchema,
    default: undefined,
    required: false
  },

  institution: {
    type: String,
    required: false
  },

  super_admin: {
    type: Boolean,
    default: false
  },

  teacherRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },

  userExpiry: {
    type: Date,
    required: false
  },

  groupCodeRef: {
    type: String,
    required: false
  },

  plannerTokenBalance: {
    type: Number,
    default: 20000
  },

  plannerTokenCycleStartedAt: {
    type: Date,
    default: null
  },

  plannerTokenResetAt: {
    type: Date,
    default: null
  },

  // Canvas ima nezavisan fond kredita i sopstveni satni ciklus.
  canvasTokenBalance: {
    type: Number,
    default: 200
  },

  canvasTokenCycleStartedAt: {
    type: Date,
    default: null
  },

  canvasTokenResetAt: {
    type: Date,
    default: null
  },

  solutions: {
    type: [solutionSchema],
    default: undefined,
    required: false
  },

  portal_access_data: {
    type: portalAccessDataSchema,
    required: false
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.model("User", schema);