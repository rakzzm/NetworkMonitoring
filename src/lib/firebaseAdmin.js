import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Replace literal \n characters with actual newlines
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        // Fallback for local development if env vars are missing but file exists
        if (!serviceAccount.projectId) {
            try {
                // Use fs to read file dynamically to avoid build-time "Module not found" errors
                const fs = require('fs');
                const path = require('path');
                // Adjust path based on runtime location needed
                const filePath = path.join(process.cwd(), 'src/lib/networkmanager-811c9-firebase-adminsdk-fbsvc-b8eeaf9a60.json');
                
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const localServiceAccount = JSON.parse(fileContent);
                    Object.assign(serviceAccount, {
                        projectId: localServiceAccount.project_id,
                        clientEmail: localServiceAccount.client_email,
                        privateKey: localServiceAccount.private_key,
                    });
                }
            } catch (e) {
                // Ignore missing file error in production
            }
        }

        if (serviceAccount.projectId) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully');
        } else {
             console.error('Firebase Admin: Missing credentials (env vars or local JSON)');
        }

    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

export const auth = admin.auth();
export const db = admin.firestore(); // If used
