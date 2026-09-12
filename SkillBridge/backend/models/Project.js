import mongoose from "mongoose";
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, title: { type: String, required: true }, description: { type: String, default: "" }, projectUrl: { type: String, default: "" }, repoUrl: { type: String, default: "" }, skillsUsed: { type: [String], default: [] }, startDate: Date, endDate: Date, isVerified: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.model("Project", schema);
