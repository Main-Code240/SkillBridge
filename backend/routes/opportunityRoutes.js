import { Router } from "express";
import {
  getOpenOpportunities,
  getOpportunityById,
} from "../controllers/opportunityController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getOpenOpportunities);
router.get("/:id", authenticate, getOpportunityById);

export default router;