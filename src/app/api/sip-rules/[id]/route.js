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
        
        db.run('UPDATE sip_rules SET name = ?, source_ip = ?, destination_ip = ?, port = ?, action = ?, priority = ? WHERE id = ?', 
            [body.name, body.source_ip, body.destination_ip, body.port, body.action, body.priority, id]);
        
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
        db.run('DELETE FROM sip_rules WHERE id = ?', [id]);
        saveDb();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
