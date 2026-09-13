import { Router } from "express";
import {
  getAssessmentById,
  submitAssessment,
} from "../controllers/assessmentController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/:id", authenticate, getAssessmentById);
router.post("/:id/attempts", authenticate, submitAssessment);

export default router;