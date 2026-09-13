import { Router } from "express";
import {
  getMySkills,
  createSkill,
  deleteSkill,
} from "../controllers/skillProfileController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getMySkills);
router.post("/", authenticate, createSkill);
router.delete("/:id", authenticate, deleteSkill);

export default router;