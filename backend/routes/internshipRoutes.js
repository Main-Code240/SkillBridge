import { Router } from "express";
import {
  getMyInternships,
  getInternshipById,
  createTask,
  updateTask,
  updateInternship,
} from "../controllers/internshipController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getMyInternships);
router.get("/:id", authenticate, getInternshipById);
router.post("/:id/tasks", authenticate, createTask);
router.patch("/:id/tasks/:taskId", authenticate, updateTask);
router.patch("/:id", authenticate, updateInternship);

export default router;