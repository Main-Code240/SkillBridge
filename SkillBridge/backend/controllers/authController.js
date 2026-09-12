import { registerUser, loginUser } from "../services/authService.js";
import User from "../models/User.js";

export async function register(req, res) {
  try {
    const { email, password, role, fullName } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ success: false, message: "email, password and fullName are required" });
    const result = await registerUser({ email, password, role, fullName });
    res.status(201).json({ success: true, ...result });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json({ success: true, ...result });
  } catch (error) { res.status(401).json({ success: false, message: error.message }); }
}

export async function me(req, res) { res.json({ success: true, user: req.user }); }

export async function updateProfile(req, res) {
  const allowed = ["fullName","phone","avatarUrl","institution","degree","department","graduationYear","location","linkedinUrl","githubUrl","portfolioUrl","bio","companyName","industryType","companySize","websiteUrl","institutionName","designation","specialization"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select("-password");
  res.json({ success: true, user });
}
