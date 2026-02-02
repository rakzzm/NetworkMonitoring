import admin from 'firebase-admin';

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully');
        } catch (error) {
            console.error('Firebase Admin initialization error:', error);
        }
    } else {
        console.warn('Firebase Admin: Missing environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Admin features will not work.');
    }
}

// Export auth/db but check if app exists to provide better errors or prevent immediate crash
const app = admin.apps.length > 0 ? admin.app() : null;
export const auth = app ? admin.auth(app) : { 
    verifyIdToken: async () => { throw new Error('Firebase Admin not initialized') },
    listUsers: async () => { throw new Error('Firebase Admin not initialized') },
    createUser: async () => { throw new Error('Firebase Admin not initialized') },
    setCustomUserClaims: async () => { throw new Error('Firebase Admin not initialized') }
};
export const db = app ? admin.firestore(app) : null;
