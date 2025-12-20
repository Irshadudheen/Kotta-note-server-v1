import mongoose from "mongoose";

const noteDownloadSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent multiple counts by same user
noteDownloadSchema.index({ noteId: 1, userId: 1 }, { unique: true });

export default mongoose.model("NoteDownload", noteDownloadSchema);
