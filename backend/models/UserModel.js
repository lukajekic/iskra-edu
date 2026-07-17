import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  type: String,
  username: String,
  password: String,

  login_banned: {
    type: Boolean,
    default: false,
  },

  activegroup: {
    type: {
      expiry: Date,
      code: String,
      work_forbidden: Boolean,
    },
    default: undefined,
    required: false,
  },

  institution: {
    type: String,
    required: false,
  },

  super_admin: {
    type: Boolean,
    default: false,
  },

  teacherRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  userExpiry: {
    type: Date,
    required: false,
  },

  groupCodeRef: String,

  plannerTokenBalance: {
    type: Number,
    default: 20000,
  },

  plannerTokenCycleStartedAt: {
    type: Date,
    default: null,
  },

  plannerTokenResetAt: {
    type: Date,
    default: null,
  },

  solutions: {
    type: [{
      solutionID: String,
      status: String,
      code: String,
      stderr: String,
      stdok: {
        type: String,
        required: false,
      },
      taskID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
      dev_ocekivani_output: {
        type: String,
        required: false,
      },
      dev_output: {
        type: String,
        required: false,
      },
      grading_date: {
        type: Date,
        required: false,
      },
      flags: {
        type: Array,
        required: false,
      },
    }],
    default: undefined,
    required: false,
  },
}, {
  timestamps: true,
});

export const UserModel = mongoose.model("User", schema);