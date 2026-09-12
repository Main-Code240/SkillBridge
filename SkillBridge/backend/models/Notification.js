import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true }, message: { type: String, default: "" },
  type: { type: String, default: "info" }, isRead: { type: Boolean, default: false }, link: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.model("Notification", schema);
