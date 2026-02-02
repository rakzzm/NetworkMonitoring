'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function TrafficLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/traffic-logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Error fetching traffic logs:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div id="traffic-logs" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.logs} Traffic Logs</h2>
                    <button className="btn btn-primary btn-sm" onClick={fetchLogs}>Refresh Logs</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Source IP</th>
                                <th>Dest IP</th>
                                <th>Port</th>
                                <th>Protocol</th>
                                <th>Bytes In</th>
                                <th>Bytes Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading Logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No Logs found</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{log.source_ip}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{log.destination_ip}</td>
                                        <td>{log.port}</td>
                                        <td>{log.protocol}</td>
                                        <td>{log.bytes_in}</td>
                                        <td>{log.bytes_out}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
