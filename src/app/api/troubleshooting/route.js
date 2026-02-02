import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const stmt = db.prepare('SELECT * FROM troubleshooting_results ORDER BY timestamp DESC');
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
        
        // Mock execution of tool
        const result = `Simulated ${body.tool_name} to ${body.target}\nSUCCESS\nLatency: 12ms`;
        const status = 'success';

        db.run('INSERT INTO troubleshooting_results (id, tool_name, target, result, status) VALUES (?, ?, ?, ?, ?)', 
            [id, body.tool_name, body.target, result, status]);
        
        saveDb();
        return NextResponse.json({ success: true, id, result, status });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
