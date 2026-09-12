import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "academician", "industry", "institution", "admin"], default: "student" },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  institution: { type: String, default: "" },
  degree: { type: String, default: "" },
  department: { type: String, default: "" },
  graduationYear: { type: Number, default: null },
  location: { type: String, default: "" },
  linkedinUrl: { type: String, default: "" },
  githubUrl: { type: String, default: "" },
  portfolioUrl: { type: String, default: "" },
  bio: { type: String, default: "" },
  companyName: { type: String, default: "" },
  industryType: { type: String, default: "" },
  companySize: { type: String, default: "" },
  websiteUrl: { type: String, default: "" },
  institutionName: { type: String, default: "" },
  designation: { type: String, default: "" },
  specialization: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
