import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = await getDb();
        
        function getCount(table, where = '') {
            const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${table} ${where}`);
            const result = stmt.getAsObject([]);
            stmt.free();
            return result.count;
        }
        
        const stats = {
            totalRouters: getCount('routers'),
            totalSwitches: getCount('switches'),
            totalAPs: getCount('access_points'),
            totalUsers: getCount('hotspot_users'),
            onlineDevices: getCount('routers', "WHERE status = 'online'") +
                           getCount('switches', "WHERE status = 'online'") +
                           getCount('access_points', "WHERE status = 'online'"),
            bandwidthUsed: Math.floor(Math.random() * 1000000000),
            activeConnections: Math.floor(Math.random() * 50000),
            cpuAverage: Math.floor(Math.random() * 100),
            memoryAverage: Math.floor(Math.random() * 100)
        };
        
        return NextResponse.json(stats);
    } catch (err) {
        console.error('Dashboard stats error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
