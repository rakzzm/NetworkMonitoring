
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const requester = await verifyAuth(req);
    if (!requester || requester.role !== 'admin') {
         // Allow admin@meghcomm.store specifically if role claim isn't set yet
        if (requester?.email !== 'admin@meghcomm.store') {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    }

    try {
        const listUsersResult = await auth.listUsers(100);
        const users = listUsersResult.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL,
            role: user.customClaims?.role || 'user', // Basic role extraction
            disabled: user.disabled,
            lastSignInTime: user.metadata.lastSignInTime,
            creationTime: user.metadata.creationTime
        }));
        
        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error listing users:', error);
        return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }
}

export async function POST(req) {
    const requester = await verifyAuth(req);
    if (!requester || requester.role !== 'admin') {
         if (requester?.email !== 'admin@meghcomm.store') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
         }
    }

    try {
        const { email, password, displayName, role } = await req.json();

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            emailVerified: false,
            password,
            displayName,
            disabled: false,
        });

        // Set custom claims for role
        if (role) {
            await auth.setCustomUserClaims(userRecord.uid, { role });
        }

        return NextResponse.json({ 
            message: 'User created successfully', 
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                role: role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
