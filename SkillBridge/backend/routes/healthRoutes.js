import { Router } from "express";
const router = Router();
router.get("/", (req, res) => res.json({ success: true, message: "SIH26044 API is running" }));
export default router;
