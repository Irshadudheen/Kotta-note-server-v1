import studentProfileRepository from '../repository/studentProfile.repo.js';
import teacherProfileRepository from '../repository/teacherProfile.repo.js';
import { HTTP_STATUS, MAX_FILE_SIZE, MESSAGES } from '../constants/index.js';
import { uploadToS3, deleteMultipleFromS3, validateFileType, validateFileSize } from '../helpers/s3.helper.js';
import { PROFILE_MESSAGES } from '../constants/profile.constants.js';
import rapidApiClient from '../connectors/rapidapiClient.js';

class ProfileController {
  constructor() {
    this.upsertStudentProfile = this.upsertStudentProfile.bind(this);
    this.upsertTeacherProfile = this.upsertTeacherProfile.bind(this);
    this.getStudentProfile = this.getStudentProfile.bind(this);
    this.getTeacherProfile = this.getTeacherProfile.bind(this);
    this.getAllStudentProfiles = this.getAllStudentProfiles.bind(this);
  }

  /**  Create / Update Student Profile */
  async upsertStudentProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = { ...req.body, refUserId: userId };
      const filesToDelete = [];

      //  Profile Image Upload
      if (req.files?.profileImage) {
        const profileImage = req.files.profileImage[0];
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!validateFileType(profileImage.mimetype, allowedImageTypes)) {
          return res.status(400).json({ success: false, message: 'Invalid profile image type.' });
        }
        if (!validateFileSize(profileImage.size, MAX_FILE_SIZE)) {
          return res.status(400).json({ success: false, message: 'Profile image too large.' });
        }

        const existing = await studentProfileRepository.findByUserId(userId);
        if (existing.success && existing.data?.profileImage) filesToDelete.push(existing.data.profileImage);

        const uploaded = await uploadToS3(profileImage.buffer, profileImage.originalname, 'student-profile-images', profileImage.mimetype);
        if (!uploaded.success) return res.status(500).json({ success: false, message: 'Image upload failed' });

        profileData.profileImage = uploaded.url;
      }

      //  Certificate Upload
      if (req.files?.certificates) {
        const certificates = req.files.certificates;
        const certificateUrls = [];
        const existing = await studentProfileRepository.findByUserId(userId);

        if (existing.success && existing.data?.certificates) {
          existing.data.certificates.forEach(c => c.certificateUrl && filesToDelete.push(c.certificateUrl));
        }

        for (const cert of certificates) {
          const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
          if (!validateFileType(cert.mimetype, allowed)) {
            return res.status(400).json({ success: false, message: 'Invalid certificate type' });
          }
          if (!validateFileSize(cert.size, MAX_FILE_SIZE)) {
            return res.status(400).json({ success: false, message: 'Certificate too large' });
          }

          const uploaded = await uploadToS3(cert.buffer, cert.originalname, 'student-certificates', cert.mimetype);
          if (!uploaded.success) return res.status(500).json({ success: false, message: 'Certificate upload failed' });

          certificateUrls.push(uploaded.url);
        }

        if (profileData.certificates) {
          profileData.certificates.forEach((c, i) => certificateUrls[i] && (c.certificateUrl = certificateUrls[i]));
        }
      }

      const result = await studentProfileRepository.updateByUserId(userId, profileData);
      if (!result.success) return res.status(result.statusCode).json(result);

      if (filesToDelete.length) deleteMultipleFromS3(filesToDelete);

      res.status(200).json({ success: true, message: PROFILE_MESSAGES.SUCCESS.PROFILE_UPDATED, data: result.data });
    } catch (err) {
      res.status(500).json({ success: false, message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR, error: err.message });
    }
  }

  /**  Create / Update Teacher Profile */
  async upsertTeacherProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = { ...req.body, refUserId: userId };
      const filesToDelete = [];

      //  Profile Image Upload
      if (req.files?.profileImage) {
        const profileImage = req.files.profileImage[0];
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!validateFileType(profileImage.mimetype, allowedImageTypes)) return res.status(400).json({ success: false, message: 'Invalid profile image' });
        if (!validateFileSize(profileImage.size, MAX_FILE_SIZE)) return res.status(400).json({ success: false, message: 'Image too large' });

        const existing = await teacherProfileRepository.findByUserId(userId);
        if (existing.success && existing.data?.profileImage) filesToDelete.push(existing.data.profileImage);

        const uploaded = await uploadToS3(profileImage.buffer, profileImage.originalname, 'teacher-profile-images', profileImage.mimetype);
        if (!uploaded.success) return res.status(500).json({ success: false, message: 'Upload failed' });

        profileData.profileImage = uploaded.url;
      }

      //  Proof Uploads
      if (req.files?.proofs) {
        const proofs = req.files.proofs;
        const proofUrls = [];
        const existing = await teacherProfileRepository.findByUserId(userId);

        if (existing.success && existing.data?.proofs) {
          existing.data.proofs.forEach(p => p.proofUrl && filesToDelete.push(p.proofUrl));
        }

        for (const file of proofs) {
          const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
          if (!validateFileType(file.mimetype, allowed)) return res.status(400).json({ success: false, message: 'Invalid proof type' });
          if (!validateFileSize(file.size, MAX_FILE_SIZE)) return res.status(400).json({ success: false, message: 'Proof too large' });

          const uploaded = await uploadToS3(file.buffer, file.originalname, 'teacher-proofs', file.mimetype);
          if (!uploaded.success) return res.status(500).json({ success: false, message: 'Proof upload failed' });

          proofUrls.push(uploaded.url);
        }

        profileData.proofs = profileData.proofs || [];
        proofUrls.forEach((url, index) => {
          if (profileData.proofs[index]) profileData.proofs[index].proofUrl = url;
          else profileData.proofs.push({ proofUrl: url, proofName: `Proof ${index + 1}` });
        });
      }

      const result = await teacherProfileRepository.updateByUserId(userId, profileData);
      if (!result.success) return res.status(result.statusCode).json(result);

      if (filesToDelete.length) deleteMultipleFromS3(filesToDelete);

      res.status(200).json({ success: true, message: PROFILE_MESSAGES.SUCCESS.PROFILE_UPDATED, data: result.data });
    } catch (err) {
      res.status(500).json({ success: false, message: 'SERVER ERROR', error: err.message });
    }
  }

  /**  Get profiles */
  async getStudentProfile(req, res) {
    const result = await studentProfileRepository.findByUserId(req.user.id);
    if (!result.success) return res.status(result.statusCode).json(result);
    if (!result.data) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.status(200).json({ success: true, data: result.data });
  }

  async getTeacherProfile(req, res) {
    const result = await teacherProfileRepository.findByUserId(req.user.id);
    if (!result.success) return res.status(result.statusCode).json(result);
    if (!result.data) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.status(200).json({ success: true, data: result.data });
  }

  /**  List all student profiles */
  async getAllStudentProfiles(req, res) {
    const result = await studentProfileRepository.searchProfiles({
      page: req.pagination.page,
      limit: req.pagination.limit,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      ...req.query
    });

    if (!result.success) return res.status(result.statusCode).json(result);
    res.status(200).json({ success: true, data: result.data.profiles, pagination: result.data.pagination });
  }

  /**  List all teacher profiles */
async getAllTeacherProfiles(req, res) {
  try {
    const result = await teacherProfileRepository.searchProfiles({
      page: req.pagination.page,
      limit: req.pagination.limit,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      ...req.query
    });

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data.profiles,
      pagination: result.data.pagination
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
}
  
}

export default new ProfileController();
