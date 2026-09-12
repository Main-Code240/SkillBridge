import mongoose from "mongoose";
const schema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", default: null },
  companyName: { type: String, default: "" }, title: { type: String, required: true },
  mentorName: { type: String, default: "" }, mentorEmail: { type: String, default: "" },
  startDate: Date, endDate: Date, goals: { type: [String], default: [] },
  status: { type: String, enum: ["started", "in_progress", "mentor_feedback", "final_evaluation", "completed", "cancelled"], default: "started" },
  progress: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });
export default mongoose.model("Internship", schema);
