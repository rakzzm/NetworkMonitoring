import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        
        const total = db.exec("SELECT COUNT(*) FROM notifications")[0].values[0][0];
        const unread = db.exec("SELECT COUNT(*) FROM notifications WHERE is_read = 0")[0].values[0][0];
        const online = db.exec("SELECT COUNT(*) FROM network_devices WHERE status = 'online'")[0].values[0][0];
        const offline = db.exec("SELECT COUNT(*) FROM network_devices WHERE status = 'offline'")[0].values[0][0];

        return NextResponse.json({ total, unread, online, offline });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
