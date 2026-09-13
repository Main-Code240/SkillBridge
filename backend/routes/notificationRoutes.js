import { Router } from "express";
import {
  getMyNotifications,
  createNotification,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.post("/", authenticate, createNotification);
router.patch("/:id/read", authenticate, markNotificationRead);

export default router;