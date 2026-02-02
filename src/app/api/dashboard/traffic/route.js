import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Simulated real-time traffic data
        // In a real app, this would query aggregated traffic_logs or a time-series DB
        const now = new Date();
        const data = Array.from({ length: 20 }).map((_, i) => {
            const time = new Date(now.getTime() - (19 - i) * 60000);
            return {
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                download: Math.floor(Math.random() * 800) + 200, // 200-1000 Mbps
                upload: Math.floor(Math.random() * 400) + 100,   // 100-500 Mbps
            };
        });

        return NextResponse.json(data);
    } catch (err) {
        console.error('Traffic API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
