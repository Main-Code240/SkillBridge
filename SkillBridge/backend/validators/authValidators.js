export function validateAuthPayload(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
  next();
}
