import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let initialized = false;

const initializeFirebase = () => {
  if (initialized) return;

  const accountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!accountJson) {
    console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_JSON not set – push notifications disabled.');
    return;
  }

  try {
    const serviceAccount = JSON.parse(accountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    initialized = true;
    console.log('[FCM] Firebase Admin initialised successfully');
  } catch (error) {
    console.error('[FCM] Failed to initialise Firebase Admin:', error.message);
  }
};

export { admin, initializeFirebase };
