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
        
        db.run('UPDATE switches SET name = ?, ip_address = ?, mac_address = ?, ports = ?, location = ? WHERE id = ?', 
            [body.name, body.ip_address, body.mac_address, body.ports, body.location, id]);
        
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
        db.run('DELETE FROM switches WHERE id = ?', [id]);
        saveDb();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
