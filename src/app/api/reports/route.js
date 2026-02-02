
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    // const user = await verifyAuth(req);
    // if (!user) {
    //    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        const db = await getDb();

        const getCount = (table, where = '') => {
            const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${table} ${where}`);
            const res = stmt.getAsObject([]);
            stmt.free();
            return res.count;
        };

        // 1. Availability & Uptime
        // Mocking uptime history based on current status
        const onlineRouters = getCount('routers', "WHERE status = 'online'");
        const totalRouters = getCount('routers');
        const routerUptime = totalRouters > 0 ? (onlineRouters / totalRouters) * 100 : 100;

        const onlineSwitches = getCount('switches', "WHERE status = 'online'");
        const totalSwitches = getCount('switches');
        const switchUptime = totalSwitches > 0 ? (onlineSwitches / totalSwitches) * 100 : 100;

        const onlineAPs = getCount('access_points', "WHERE status = 'online'");
        const totalAPs = getCount('access_points');
        const apUptime = totalAPs > 0 ? (onlineAPs / totalAPs) * 100 : 100;

        // 2. Performance & Health
        // Fetch specific metrics from routers for charts
        const routerMetricsStmt = db.prepare("SELECT name, cpu_usage, memory_usage FROM routers LIMIT 5");
        const routerMetrics = [];
        while(routerMetricsStmt.step()) routerMetrics.push(routerMetricsStmt.getAsObject());
        routerMetricsStmt.free();

        // 3. Bandwidth & Traffic Analysis
        // Aggregate traffic logs by protocol
        const trafficByProtoStmt = db.prepare("SELECT protocol, SUM(bytes_in + bytes_out) as total_bytes FROM traffic_logs GROUP BY protocol");
        const trafficByProto = [];
        while(trafficByProtoStmt.step()) trafficByProto.push(trafficByProtoStmt.getAsObject());
        trafficByProtoStmt.free();

        // Top Talkers (Source IPs)
        const topTalkersStmt = db.prepare("SELECT source_ip, SUM(bytes_in + bytes_out) as total_bytes FROM traffic_logs GROUP BY source_ip ORDER BY total_bytes DESC LIMIT 5");
        const topTalkers = [];
        while(topTalkersStmt.step()) topTalkers.push(topTalkersStmt.getAsObject());
        topTalkersStmt.free();

        // 4. Security & Incident Logs
        const alertsStmt = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10");
        const alerts = [];
        while(alertsStmt.step()) alerts.push(alertsStmt.getAsObject());
        alertsStmt.free();

        const criticalCount = getCount('notifications', "WHERE severity = 'critical'");
        const warningCount = getCount('notifications', "WHERE severity = 'warning'");

        const reportData = {
            availability: {
                routers: routerUptime,
                switches: switchUptime,
                accessPoints: apUptime,
                overall: ((routerUptime + switchUptime + apUptime) / 3).toFixed(2)
            },
            performance: {
                routers: routerMetrics
            },
            traffic: {
                byProtocol: trafficByProto,
                topTalkers: topTalkers
            },
            security: {
                criticalAlerts: criticalCount,
                warningAlerts: warningCount,
                recentAlerts: alerts
            }
        };

        return NextResponse.json(reportData);
    } catch (err) {
        console.error('Reports API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
