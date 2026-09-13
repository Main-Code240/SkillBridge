import { Router } from "express";
import {
  getMyProjects,
  createProject,
  deleteProject,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getMyProjects);
router.post("/", authenticate, createProject);
router.delete("/:id", authenticate, deleteProject);

export default router;