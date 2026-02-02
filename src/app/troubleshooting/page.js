'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function TroubleshootingPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        fetchResults();
    }, []);

    async function fetchResults() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/troubleshooting', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    }

    async function runTest(tool, target) {
        setRunning(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/troubleshooting', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tool_name: tool, target: target })
            });
            if (res.ok) {
                fetchResults();
            }
        } catch (error) {
            alert('Error running test');
        } finally {
            setRunning(false);
        }
    }

    return (
        <div id="troubleshooting" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.troubleshoot} Troubleshooting Tools</h2>
                    <div>
                        <button className="btn btn-secondary btn-sm" style={{marginRight: '10px'}} onClick={() => runTest('PING', '8.8.8.8')} disabled={running}>Ping 8.8.8.8</button>
                        <button className="btn btn-primary btn-sm" onClick={() => runTest('TRACEROUTE', 'google.com')} disabled={running}>Traceroute Google</button>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Tool</th>
                                <th>Target</th>
                                <th>Result</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading...</td></tr>
                            ) : results.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No Results found</td></tr>
                            ) : (
                                results.map(r => (
                                    <tr key={r.id}>
                                        <td>{new Date(r.timestamp).toLocaleString()}</td>
                                        <td>{r.tool_name}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{r.target}</td>
                                        <td>{r.result}</td>
                                        <td>
                                            <span className={`status-badge status-${r.status === 'success' ? 'active' : 'inactive'}`}>
                                                {r.status}
                                            </span>
                                        </td>
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
