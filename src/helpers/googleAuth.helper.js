import admin from "firebase-admin";
import { ENV_CONFIG } from "../config/env.config.js";

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: ENV_CONFIG.FIREBASE_PROJECT_ID,
    clientEmail: ENV_CONFIG.FIREBASE_CLIENT_EMAIL,
    privateKey: ENV_CONFIG.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

/**
 * Verify Firebase ID token (single attempt)
 * @param {string} idToken - Firebase ID token from frontend
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    console.log("Verifying Firebase ID token:", idToken);

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    console.log("Firebase token verified successfully");

    return {
      success: true,
      data: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        emailVerified: decodedToken.email_verified,
        firebaseProvider: decodedToken.firebase?.sign_in_provider,
      },
    };

  } catch (error) {
    console.error("Firebase token verification failed:", error);

    return {
      success: false,
      error: "Invalid Firebase token",
    };
  }
};
