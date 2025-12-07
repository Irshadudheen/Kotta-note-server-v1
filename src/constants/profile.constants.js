export const PROFILE_MESSAGES = {
    SUCCESS: {
        PROFILE_CREATED: 'Profile created successfully',
        PROFILE_UPDATED: 'Profile updated successfully',
        PROFILE_RETRIEVED: 'Profile retrieved successfully',
    },
    ERROR: {
        PROFILE_NOT_FOUND: 'Profile not found',
        PROFILE_UPDATE_FAILED: 'Profile update failed',
        PROFILE_CREATE_FAILED: 'Profile create failed', 
        INVALID_FILE_TYPE: 'Invalid file type for profile image. Only JPEG and PNG are allowed.',
        PROFILE_IMAGE_SIZE_TOO_LARGE: 'Profile image size too large. Maximum 5MB allowed.',
        FILE_UPLOAD_FAILED: 'Failed to upload profile image',
        INVALID_FILE_TYPE_PROOF: 'Invalid file type for proof. Only JPEG, PNG, and PDF are allowed.',
        PROOF_SIZE_TOO_LARGE: 'Proof size too large. Maximum 5MB allowed.',
    }
}