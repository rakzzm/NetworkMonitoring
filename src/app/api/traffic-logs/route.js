import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const stmt = db.prepare('SELECT * FROM traffic_logs ORDER BY timestamp DESC LIMIT 100');
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
