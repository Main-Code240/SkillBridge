import mongoose from "mongoose";
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, title: { type: String, required: true }, description: { type: String, default: "" }, collaborationType: { type: String, required: true }, institution: { type: String, default: "" }, industry: { type: String, default: "" }, status: { type: String, default: "open" }, startDate: Date, endDate: Date }, { timestamps: true });
export default mongoose.model("Collaboration", schema);
