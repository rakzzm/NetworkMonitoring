import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const stmt = db.prepare('SELECT * FROM bandwidth_rules');
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

export async function POST(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const db = await getDb();
        const id = uuidv4();
        
        db.run('INSERT INTO bandwidth_rules (id, name, download_speed, upload_speed, priority, description) VALUES (?, ?, ?, ?, ?, ?)', 
            [id, body.name, body.download_speed, body.upload_speed, body.priority, body.description]);
        
        saveDb();
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
