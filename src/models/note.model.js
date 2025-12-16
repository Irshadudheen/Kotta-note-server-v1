import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader ID is required'],
      index: true
    },

    uploaderType: {
      type: String,
      required: [true, 'Uploader type is required'],
      enum: ['student', 'teacher'],
      trim: true
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },

    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },

    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true
    },

    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [10, 'Semester cannot exceed 10']
    },
    module: {
      type: Number,
      required: [true, 'Module is required'],
      min: [1, 'Module must be at least 1'],
      max: [10, 'Module cannot exceed 10']
    },
    

    noteUrl: {
      type: String,
      required: [true, 'Note file URL is required']
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'deleted'],
      default: 'active'
    },
    isPublic:{
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
