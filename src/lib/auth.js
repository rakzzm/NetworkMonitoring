import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

const JWT_SECRET = 'netmanager-secret-key-2024';

export async function verifyAuth(req) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return null;

    try {
        // Try verifying as a local JWT first (legacy)
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        // If local verification fails, try Firebase verification
        try {
            const { auth } = await import('./firebaseAdmin');
            const decodedToken = await auth.verifyIdToken(token);
            return {
                id: decodedToken.uid,
                username: decodedToken.name || decodedToken.email?.split('@')[0] || 'Unknown',
                email: decodedToken.email,
                role: decodedToken.role || (decodedToken.email === 'admin@meghcomm.store' ? 'admin' : 'read_only'), // Default role logic or custom claims
                picture: decodedToken.picture
            };
        } catch (firebaseErr) {
            console.error('Auth verification failed:', firebaseErr.message);
            return null;
        }
    }
}

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
