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
        
        db.run('UPDATE devices SET name = ?, mac_address = ?, ip_address = ?, type = ?, status = ? WHERE id = ?', 
            [body.name, body.mac_address, body.ip_address, body.type, body.status, id]);
        
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
        db.run('DELETE FROM devices WHERE id = ?', [id]);
        saveDb();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
