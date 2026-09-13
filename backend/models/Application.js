import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", required: true },
  coverLetter: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  status: { type: String, enum: ["submitted", "under_review", "shortlisted", "interview", "selected", "rejected", "withdrawn"], default: "submitted" },
  matchScore: { type: Number, default: 0 },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  industryNotes: { type: String, default: "" }
}, { timestamps: true });
schema.index({ user: 1, opportunity: 1 }, { unique: true });
export default mongoose.model("Application", schema);
