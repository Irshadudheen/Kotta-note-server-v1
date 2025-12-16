import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3_CONFIG } from '../constants/index.js';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_CONFIG.REGION, // REQUIRED for R2
  endpoint: S3_CONFIG.ENDPOINT, // 🔥 R2 endpoint
  credentials: {
    accessKeyId: S3_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: S3_CONFIG.SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (fileBuffer, originalName, folder, mimeType) => {
  try {
    const fileExtension = originalName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    const uploadParams = {
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `${S3_CONFIG.PUBLIC_BASE_URL}/${key}`;

    return {
      success: true,
      url: fileUrl,
      key,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


export const deleteFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl?.startsWith(S3_CONFIG.PUBLIC_BASE_URL)) {
      return { success: true, message: 'Not an R2 URL' };
    }

    const key = fileUrl.replace(`${S3_CONFIG.PUBLIC_BASE_URL}/`, '');

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key,
      })
    );

    return { success: true };
  } catch (error) {
    console.error('R2 delete error:', error);
    return { success: false, error: error.message };
  }
};


export const deleteMultipleFromS3 = async (fileUrls) => {
  try {
    if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
      return {
        success: true,
        message: 'No files to delete',
      };
    }

    const deletePromises = fileUrls.map(url => deleteFromS3(url));
    const results = await Promise.all(deletePromises);

    const failedDeletes = results.filter(result => !result.success);
    
    if (failedDeletes.length > 0) {
      return {
        success: false,
        error: `Failed to delete ${failedDeletes.length} files`,
        failedDeletes,
      };
    }

    return {
      success: true,
      message: 'All files deleted successfully',
    };
  } catch (error) {
    console.error('S3 bulk delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


export const extractKeyFromUrl = (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('amazonaws.com')) {
    return null;
  }
  
  const urlParts = fileUrl.split('/');
  return urlParts.slice(3).join('/');
};


export const validateFileType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

export const validateFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};
