import mongoose from "mongoose";
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, title: { type: String, required: true }, issuer: { type: String, default: "" }, issueDate: Date, expiryDate: Date, certificateUrl: { type: String, default: "" }, skillName: { type: String, default: "" } }, { timestamps: true });
export default mongoose.model("Certificate", schema);
