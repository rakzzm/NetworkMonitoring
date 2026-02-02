
import admin from 'firebase-admin';

import serviceAccount from '../../networkmanager-811c9-firebase-adminsdk-fbsvc-b8eeaf9a60.json';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

export const auth = admin.auth();
export const db = admin.firestore(); // If used
