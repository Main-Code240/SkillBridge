import { Router } from "express";
import {
  getMyCertificates,
  createCertificate,
  deleteCertificate,
} from "../controllers/certificateController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getMyCertificates);
router.post("/", authenticate, createCertificate);
router.delete("/:id", authenticate, deleteCertificate);

export default router;