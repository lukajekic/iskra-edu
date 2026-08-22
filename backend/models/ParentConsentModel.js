import mongoose from "mongoose";


const schema = new mongoose.Schema(
  {
    studentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },


    studentUsername: {
      type: String,
      required: true,
    },

    parentName: {
      type: String,
      required: true,
      trim: true,
    },


    consentVersion: {
      type: String,
      required: true,
    },

    ipAddress: {
      type: String,
      required: false,
    },

    userAgent: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const ParentConsentModel = mongoose.model("ParentConsent", schema);
