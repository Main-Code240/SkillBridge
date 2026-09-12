import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: null },
  skillName: { type: String, required: true },
  category: { type: String, default: "" },
  score: { type: Number, min: 0, max: 100, default: 0 },
  level: { type: String, enum: ["beginner", "intermediate", "advanced", "expert"], default: "beginner" },
  source: { type: String, default: "manual" },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

export default mongoose.model("SkillProfile", schema);
