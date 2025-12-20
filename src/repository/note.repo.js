import Note from '../models/note.model.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import mongoose from 'mongoose';

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
  async findByUser(userId) {
    try {
     
      const notes = await Note.find({
        userId
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
  async getAllNotes(page = 1, limit = 10, search='') {
    try {
      const skip = (page - 1) * limit;
      

       const searchFilter = search 
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } },
          
        ],
      }
    : {};
    console.log(search)
    console.log(searchFilter)

        // if (filters.semester) {
        //   query.semester = Number(filters.semester);
        // }

        // if (filters.module) {
        //   query.module = Number(filters.module);
        // }
      // console.log(searchFilter)
      const [notes, total] = await Promise.all([
        Note.find(searchFilter)
          .populate({
      path: 'userId',
      select: 'name' // choose fields you need
    })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Note.countDocuments(searchFilter)
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
      console.log(error)
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

/**
 * Increment download count (once per user)
 */
async incrementDownloadCount(noteId, userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return {
        success: false,
        error: "Invalid noteId",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      };
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        error: "Invalid userId",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      };
    }

    // Try to record user download
    await NoteDownload.create({ noteId, userId });

    // Increment count only on first download
    await Note.findByIdAndUpdate(
      noteId,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    return {
      success: true,
      counted: true,
    };
  } catch (error) {
    // Duplicate download → already counted
    if (error.code === 11000) {
      return {
        success: true,
        counted: false,
      };
    }

    return {
      success: false,
      error: error.message,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
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
