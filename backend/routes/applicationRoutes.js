import { Router } from "express";
import {
  getMyApplications,
  applyToOpportunity,
} from "../controllers/applicationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getMyApplications);
router.post("/", authenticate, applyToOpportunity);

export default router;