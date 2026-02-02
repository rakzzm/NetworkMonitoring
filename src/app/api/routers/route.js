import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const stmt = db.prepare('SELECT * FROM routers');
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return NextResponse.json(results);
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, ip_address, mac_address, firmware_version, location } = await req.json();
        const db = await getDb();
        const id = uuidv4();
        
        db.run('INSERT INTO routers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [id, name, ip_address, mac_address, firmware_version, 'online', location, '0d 0h 0m', 0, 0]);
        saveDb();
        
        return NextResponse.json({ id, name, ip_address, mac_address, firmware_version, status: 'online', location });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
