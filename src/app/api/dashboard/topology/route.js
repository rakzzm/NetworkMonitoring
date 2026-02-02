import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') || 'all'; // 'all', 'wan', 'lan'

    try {
        const db = await getDb();
        
        let routers = [], switches = [], aps = [], clients = [];
        const nodes = [];
        const links = [];

        // Fetch Data based on view
        if (view === 'all' || view === 'wan') {
            routers = db.exec("SELECT id, name, status, 'router' as type FROM routers")[0]?.values.map(v => ({ id: v[0], name: v[1], status: v[2], type: v[3] })) || [];
        }

        if (view === 'all' || view === 'lan' || view === 'wan') {
             // WAN view also usually includes APs as they are wireless
            aps = db.exec("SELECT id, name, status, 'ap' as type FROM access_points")[0]?.values.map(v => ({ id: v[0], name: v[1], status: v[2], type: v[3] })) || [];
        }

        if (view === 'all' || view === 'lan') {
            switches = db.exec("SELECT id, name, status, 'switch' as type FROM switches")[0]?.values.map(v => ({ id: v[0], name: v[1], status: v[2], type: v[3] })) || [];
            // Simulate some clients for LAN view
            clients = [
                { id: 'pc1', name: 'Desktop-01', type: 'client', status: 'online' },
                { id: 'pc2', name: 'Laptop-CEO', type: 'client', status: 'online' },
                { id: 'printer', name: 'Office Printer', type: 'client', status: 'online' },
                { id: 'server', name: 'File Server', type: 'client', status: 'online' }
            ];
        }

        // --- Layout Logic ---
        
        if (view === 'wan') {
            // Layout for WAN: Cloud -> Routers -> APs
            nodes.push({ id: 'cloud', name: 'Internet (ISP)', type: 'cloud', x: 400, y: 50 });
            routers.forEach((r, i) => nodes.push({ ...r, x: 200 + (i * 200), y: 150 }));
            aps.forEach((a, i) => nodes.push({ ...a, x: 100 + (i * 150), y: 350 }));

            routers.forEach(r => links.push({ source: 'cloud', target: r.id }));
            // Link APs to Routers for WAN view simplicity (Wireless direct to gateway metaphor)
            aps.forEach((a, i) => {
                const parent = routers[i % routers.length];
                if (parent) links.push({ source: parent.id, target: a.id });
            });

        } else if (view === 'lan') {
            // Layout for LAN: Switches -> APs & Clients
            // We need a "Gateway" placeholder to show upstream connection
            nodes.push({ id: 'gateway', name: 'Gateway', type: 'router', x: 400, y: 50 });
            
            switches.forEach((s, i) => nodes.push({ ...s, x: 150 + (i * 200), y: 150 }));
            aps.forEach((a, i) => nodes.push({ ...a, x: 100 + (i * 200), y: 300 }));
            clients.forEach((c, i) => nodes.push({ ...c, x: 400 + (i * 100), y: 300 })); // Clients on right

            // Links
            switches.forEach(s => links.push({ source: 'gateway', target: s.id }));
            
            // Distribute APs and Clients among switches
            const allDevices = [...aps, ...clients];
            allDevices.forEach((d, i) => {
                const parent = switches[i % switches.length];
                if (parent) links.push({ source: parent.id, target: d.id });
            });

        } else {
            // Default 'all' view
             nodes.push({ id: 'cloud', name: 'Internet', type: 'cloud', x: 400, y: 50 });
             routers.forEach((r, i) => nodes.push({ ...r, x: 200 + (i * 400), y: 150 }));
             switches.forEach((s, i) => nodes.push({ ...s, x: 100 + (i * 150), y: 300 }));
             aps.forEach((a, i) => nodes.push({ ...a, x: 50 + (i * 100), y: 450 }));

             routers.forEach(r => links.push({ source: 'cloud', target: r.id }));
             switches.forEach((s, i) => {
                const parent = routers[i % routers.length];
                if (parent) links.push({ source: parent.id, target: s.id });
             });
             aps.forEach((a, i) => {
                const parent = switches[i % switches.length];
                if (parent) links.push({ source: parent.id, target: a.id });
             });
        }

        return NextResponse.json({ nodes, links });
    } catch (err) {
        console.error('Topology API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
