import Note from '../models/note.model.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

class NoteRepository {

  /**
   * Create note
   */
  async createNote(noteData) {
    try {
        console.log(noteData)
      const note = await Note.create(noteData);

      return {
        success: true,
        data: note
      };
    } catch (error) {
        console.log(error)
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Find note by ID
   */
  async findById(noteId) {
    try {
      const note = await Note.findById(noteId);

      if (!note) {
        return {
          success: false,
          error: MESSAGES.ERROR.NOT_FOUND || 'Note not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: note
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Get notes uploaded by a teacher
   */
  async findByTeacherId(teacherId) {
    try {
      const notes = await Note.find({
        refTeacherId: teacherId,
        isActive: true
      }).sort({ createdAt: -1 });

      return {
        success: true,
        data: notes
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Search notes (student view)
   */
  async getAllNotes(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;

      const query = { isActive: true };

      if (filters.department) query.department = filters.department;
      if (filters.subject) query.subject = filters.subject;
      if (filters.semester) query.semester = filters.semester;

      const [notes, total] = await Promise.all([
        Note.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Note.countDocuments(query)
      ]);

      return {
        success: true,
        data: {
          notes,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalNotes: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Update note (metadata only)
   */
  async updateById(noteId, teacherId, updateData) {
    try {
      const note = await Note.findOneAndUpdate(
        { _id: noteId, refTeacherId: teacherId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!note) {
        return {
          success: false,
          error: MESSAGES.ERROR.NOT_FOUND || 'Note not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: note
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Soft delete note
   */
  async deleteById(noteId, teacherId) {
    try {
      const note = await Note.findOneAndUpdate(
        { _id: noteId, refTeacherId: teacherId },
        { isActive: false },
        { new: true }
      );

      if (!note) {
        return {
          success: false,
          error: MESSAGES.ERROR.NOT_FOUND || 'Note not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: note
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }
}

export default new NoteRepository();
