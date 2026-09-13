import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, default: "" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  opportunityType: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  preferredSkills: { type: [String], default: [] },
  eligibility: { type: String, default: "" },
  education: { type: String, default: "" },
  experience: { type: String, default: "" },
  location: { type: String, default: "" },
  workMode: { type: String, enum: ["onsite", "remote", "hybrid"], default: "onsite" },
  duration: { type: String, default: "" },
  stipend: { type: String, default: "" },
  salary: { type: String, default: "" },
  applicationDeadline: { type: Date, default: null },
  numPositions: { type: Number, default: 1 },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  contactEmail: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  status: { type: String, enum: ["draft", "open", "closed", "cancelled"], default: "open" }
}, { timestamps: true });

export default mongoose.model("Opportunity", schema);
