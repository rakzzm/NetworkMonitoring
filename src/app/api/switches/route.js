import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const stmt = db.prepare('SELECT * FROM switches');
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
        const { name, ip_address, mac_address, port_count, poe_ports, vlan_support, location } = await req.json();
        const db = await getDb();
        const id = uuidv4();
        
        db.run('INSERT INTO switches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [id, name, ip_address, mac_address, port_count, 'v1.0.0', 'online', location, vlan_support, poe_ports, new Date().toISOString()]);
        saveDb();
        
        return NextResponse.json({ id, name });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
