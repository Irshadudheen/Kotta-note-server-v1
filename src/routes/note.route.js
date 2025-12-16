import express from "express";
import { authenticateToken } from '../middleware/auth.js';
import notesController from '../controller/note.controller.js'
import { validateNoteUpload } from "../middleware/validation.js";
import {upload} from '../middleware/upload.js'
import { requireRole } from '../middleware/rbac.middleware.js';
import { ROLES } from "../constants/rbac.constants.js";

const router = express.Router();

/**
 * @route   POST /api/note/upload
 * @desc    Upload study notes
 * @access  Private (JWT)
 */
router.post("/upload",
    authenticateToken,
    requireRole(ROLES.STUDENT),
    upload.single("noteFile"),
    validateNoteUpload,
    notesController.uploadNotes);

/**
 * @route   GET /api/note/
 * @desc    Get study notes
 * @access  Private (JWT)
 */
router.get("/",
    authenticateToken,
    requireRole(ROLES.STUDENT),
    notesController.getMyNotes);

export default router;
