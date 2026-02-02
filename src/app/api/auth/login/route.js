import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { username, password } = await req.json();
        const db = await getDb();
        
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const result = stmt.getAsObject([username]);
        stmt.free();
        
        if (!result || !result.username || !bcrypt.compareSync(password, result.password)) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        
        const token = signToken({ id: result.id, username: result.username, role: result.role });
        return NextResponse.json({ 
            token, 
            user: { id: result.id, username: result.username, email: result.email, role: result.role } 
        });
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
