/**
 * Notes Upload – Related Constants
 */

// Departments / Subjects
export const SUBJECTS = {
  COMPUTER_SCIENCE: "Computer Science",
  COMMERCE: "Commerce",
  HUMANITIES: "Humanities",
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  MATHEMATICS: "Mathematics",
  ENGLISH: "English",
  ARABIC: "Arabic",
  MALAYALAM: "Malayalam",
  OTHER: "Other"
};

// Academic Year
export const ACADEMIC_YEARS = {
  FIRST_YEAR: "1st Year",
  SECOND_YEAR: "2nd Year",
  THIRD_YEAR: "3rd Year",
  FOURTH_YEAR: "4th Year"
};

// Notes Types
export const NOTES_TYPES = {
  PDF: "PDF",
  PPT: "PPT",
  WORD: "Word Document",
  IMAGE: "Image",
  OTHER: "Other"
};

// Notes Status
export const NOTES_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  REJECTED: "rejected"
};

// Languages of Notes
export const NOTES_LANGUAGES = {
  ENGLISH: "English",
  MALAYALAM: "Malayalam",
  ARABIC: "Arabic",
  HINDI: "Hindi",
  OTHER: "Other"
};

// Upload Limits
export const UPLOAD_LIMITS = {
  VERIFIED_STUDENT: 10, // 10 uploads per day
  UNVERIFIED_STUDENT: 2, // 2 uploads per day
  MAX_FILE_SIZE_MB: 25 // Each file max 25 MB
};

// Filters – Sort Uploaded Notes
export const SORT_FILTERS = {
  ALL: "all",
  LAST_24H: "24h",
  LAST_3_DAYS: "3d",
  LAST_7_DAYS: "7d",
  MOST_VIEWED: "most_viewed",
  MOST_DOWNLOADED: "most_downloaded"
};

// User Notifications / Messages
export const NOTES_MESSAGES = {
  SUCCESS: {
    NOTE_UPLOADED: "Note uploaded successfully",
    NOTE_UPDATED: "Note updated successfully",
    NOTE_DELETED: "Note deleted successfully",
    NOTE_ARCHIVED: "Note archived successfully"
  },
  ERROR: {
    NOTE_NOT_FOUND: "Note not found",
    UNAUTHORIZED: "You are not authorized to perform this action",
    PROFILE_NOT_VERIFIED: "Your account must be verified to upload notes",
    UPLOAD_LIMIT_EXCEEDED: "Daily upload limit exceeded",
    ACCOUNT_RESTRICTED: "Your account is temporarily restricted from uploading notes",
    FILE_TOO_LARGE: "Maximum allowed file size is 25MB",
    UNSUPPORTED_FILE_TYPE: "Unsupported file format",
    CUSTOM_SUBJECT_REQUIRED: 'Custom subject name is required when subject is "Other"'
  }
};

export default {
  SUBJECTS,
  ACADEMIC_YEARS,
  NOTES_TYPES,
  NOTES_STATUS,
  NOTES_LANGUAGES,
  UPLOAD_LIMITS,
  SORT_FILTERS,
  NOTES_MESSAGES
};
