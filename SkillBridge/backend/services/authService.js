import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export async function registerUser({ email, password, role, fullName }) {
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new Error("Email is already registered");
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase(), password: hashed, role, fullName });
  return { token: signToken(user.id), user: user.toObject() };
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) throw new Error("Invalid email or password");
  if (user.status !== "active") throw new Error("Account is not active");
  const safeUser = user.toObject(); delete safeUser.password;
  return { token: signToken(user.id), user: safeUser };
}
