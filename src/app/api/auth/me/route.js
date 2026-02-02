import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const user = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = await getDb();
        const stmt = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
        const result = stmt.getAsObject([user.id]);
        stmt.free();
        
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
