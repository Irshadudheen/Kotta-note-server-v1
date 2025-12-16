import notesRepository from "../repository/note.repo.js";
import { MAX_FILE_SIZE, MESSAGES } from "../constants/index.js";
import {
  uploadToS3,
  deleteMultipleFromS3,
  validateFileType,
  validateFileSize,
} from "../helpers/s3.helper.js";

class NotesController {
  constructor() {
    this.uploadNotes = this.uploadNotes.bind(this);
    this.getMyNotes = this.getMyNotes.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  /**  Upload Notes */
  async uploadNotes(req, res) {
    try {
      const userId = req.user.id;
      const uploaderType = req.user.userType;
      console.log(req.user)
      const { subject, department,semester,title,module ,isPublic                                                                                                                                                                                                                                                                                                                                                        } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Notes file is required",
        });
      }

      const file = req.file;

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!validateFileType(file.mimetype, allowedTypes)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type",
        });
      }

      if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
        return res.status(400).json({
          success: false,
          message: "File size exceeds limit",
        });
      }

      //  Upload to S3
      const uploaded = await uploadToS3(
        file.buffer,
        file.originalname,
        "notes",
        file.mimetype
      );

      if (!uploaded.success) {
        return res.status(500).json({
          success: false,
          message: "File upload failed",
        });
      }

      const noteData = {
        userId,
        semester,
        subject,
        module,
        isPublic,
        title,
        uploaderType,
        department,
        noteUrl: uploaded.url,
        uploadedAt: new Date(),
      };

      const result = await notesRepository.createNote(noteData);

      if (!result.success) {
        deleteMultipleFromS3([uploaded.url]);
        return res.status(500).json({
          success: false,
          message: "Failed to save notes",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Notes uploaded successfully",
        data: result.data,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**  Get My Notes */
  async getMyNotes(req, res) {
    try {
 
      const result = await notesRepository.findByUser(req.user.id);
    

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch notes",
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  /** 🗑️ Delete Note */
  async deleteNote(req, res) {
    try {
      const { noteId } = req.params;

      const result = await notesRepository.deleteById(noteId);
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }
}

export default new NotesController();
