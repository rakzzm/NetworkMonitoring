import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req, { params }) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = params;
        const body = await req.json();
        const db = await getDb();
        
        db.run('UPDATE access_points SET name = ?, ip_address = ?, mac_address = ?, ssid = ?, location = ? WHERE id = ?', 
            [body.name, body.ip_address, body.mac_address, body.ssid, body.location, id]);
        
        saveDb();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = params;
        const db = await getDb();
        db.run('DELETE FROM access_points WHERE id = ?', [id]);
        saveDb();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
