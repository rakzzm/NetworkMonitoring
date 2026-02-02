
'use client';

import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import './reports.css';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('availability'); // availability, performance, traffic, security
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch('/api/reports', { headers })
            .then(res => {
                if (res.status === 401) {
                    throw new Error('Unauthorized');
                }
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                return res.json();
            })
            .then(resData => {
                setData(resData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch reports:", err);
                if (err.message === 'Unauthorized') {
                    // Optional: redirect to login
                    // window.location.href = '/login';
                    setData({ error: 'Unauthorized. Please log in.' });
                } else {
                    setData({ error: err.message });
                }
                setLoading(false);
            });
    }, []);



    if (!isMounted) return null; 

    if (loading) {
        return <div className="p-8 text-center">Generating Enterprise Reports...</div>;
    }

    if (!data || data.error) {
        return (
            <div className="p-8 text-center text-red-500">
                <h3 className="font-bold">Access Denied or Error</h3>
                <p>{data?.error || 'Failed to load reporting data.'}</p>
                {data?.error && data.error.includes('Unauthorized') && (
                    <a href="/login" className="btn btn-primary mt-4 inline-block">Go to Login</a>
                )}
            </div>
        );
    }

    // Safety check for data structure to prevent crashes
    const safeAvailability = data.availability || { routers: 0, switches: 0, accessPoints: 0, overall: 0 };
    const safePerformance = data.performance || { routers: [] };
    const safeTraffic = data.traffic || { byProtocol: [], topTalkers: [] };
    const safeSecurity = data.security || { criticalAlerts: 0, warningAlerts: 0, informationalEvents: 0 };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const handleExport = (format) => {
        alert(`Exporting report as ${format}... (Functionality mocked)`);
    };

    if (loading) {
        return <div className="p-8 text-center">Generating Enterprise Reports...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Failed to load reporting data.</div>;
    }

    // Prepare data for charts
    const availabilityData = [
        { name: 'Routers', value: safeAvailability.routers },
        { name: 'Switches', value: safeAvailability.switches },
        { name: 'Access Points', value: safeAvailability.accessPoints },
    ];


    return (
        <div className="report-container">
            <div className="report-header">
                <div>
                    <h1 className="page-title">Analytics & Reports</h1>
                    <p className="page-subtitle">Enterprise Network Insights & Historical Analysis</p>
                </div>
                <div className="report-actions">
                    <button onClick={() => handleExport('PDF')} className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Export PDF
                    </button>
                    <button onClick={() => handleExport('CSV')} className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Reporting Tabs */}
            <div className="report-tabs">
                <button className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>Availability & Uptime</button>
                <button className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Performance & Health</button>
                <button className={`tab-btn ${activeTab === 'traffic' ? 'active' : ''}`} onClick={() => setActiveTab('traffic')}>Bandwidth & Traffic</button>
                <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security & Compliance</button>
            </div>

            {/* Content Area */}
            <div className="report-content animate-fadeIn">
                
                {activeTab === 'availability' && (
                    <div className="tab-pane">
                        <div className="report-grid-3">
                            <div className="report-card">
                                <h3 className="card-label">Overall Network Uptime</h3>
                                <div className="stat-value text-green">{safeAvailability.overall}%</div>
                                <div className="stat-helper">SLA Target: 99.99%</div>
                            </div>
                            <div className="report-card">
                                <h3 className="card-label">Downtime (Last 30 Days)</h3>
                                <div className="stat-value">4m 32s</div>
                                <div className="stat-helper text-green">Within acceptable limits</div>
                            </div>
                            <div className="report-card">
                                <h3 className="card-label">MTTR (Mean Time To Repair)</h3>
                                <div className="stat-value text-blue">12m</div>
                                <div className="stat-helper">Average response time</div>
                            </div>
                        </div>

                        <div className="report-card full-width">
                            <h3 className="card-title">Device Availability breakdown</h3>
                            <div className="chart-container-lg">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={availabilityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis dataKey="name" type="category" width={100} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Uptime %" barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="tab-pane">
                        <div className="report-card full-width">
                            <h3 className="card-title">Router Hardware Health (CPU & Memory)</h3>
                            <div className="chart-container-xl">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={safePerformance.routers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                                        <Legend />
                                        <Bar dataKey="cpu_usage" name="CPU Usage %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="memory_usage" name="Memory Usage %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="report-grid-2">
                            <div className="report-card">
                                <h3 className="card-title">Network Latency (Avg ms)</h3>
                                <div className="chart-container-md">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[
                                            {time: '00:00', ms: 12}, {time: '04:00', ms: 10}, {time: '08:00', ms: 45},
                                            {time: '12:00', ms: 55}, {time: '16:00', ms: 30}, {time: '20:00', ms: 15},
                                            {time: '23:59', ms: 11}
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="ms" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                             <div className="report-card centered-content">
                                <h3 className="card-title">Packet Loss (%)</h3>
                                <div className="radial-wrapper">
                                    <div className="radial-progress text-primary" style={{"--value":0.05, "--size": "12rem"}}>0.05%</div>
                                    <p className="stat-helper">Average Packet Loss</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'traffic' && (
                    <div className="tab-pane">
                        <div className="report-grid-2">
                            <div className="report-card">
                                <h3 className="card-title">Traffic by Protocol</h3>
                                <div className="chart-container-md">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={safeTraffic.byProtocol}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="total_bytes"
                                                nameKey="protocol"
                                                label
                                            >
                                                {safeTraffic.byProtocol.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val) => `${(val / 1024 / 1024).toFixed(2)} MB`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="report-card">
                                <h3 className="card-title">Top Talkers (Source IPs)</h3>
                                <div className="chart-container-md">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={safeTraffic.topTalkers} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="source_ip" type="category" width={110} />
                                            <Tooltip formatter={(val) => `${(val / 1024).toFixed(2)} KB`} />
                                            <Bar dataKey="total_bytes" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="tab-pane">
                         <div className="report-grid-3">
                            <div className="report-card border-l-red">
                                <h3 className="card-label">Critical Alerts</h3>
                                <div className="stat-value text-red">{safeSecurity.criticalAlerts}</div>
                                <div className="stat-helper">Requires immediate attention</div>
                            </div>
                            <div className="report-card border-l-yellow">
                                <h3 className="card-label">Warning Events</h3>
                                <div className="stat-value text-yellow">{safeSecurity.warningAlerts}</div>
                                <div className="stat-helper">Potential issues detected</div>
                            </div>
                            <div className="report-card border-l-green">
                                <h3 className="card-label">Policy Compliance</h3>
                                <div className="stat-value text-green">98.5%</div>
                                <div className="stat-helper">PCI-DSS / HIPAA Ready</div>
                            </div>
                        </div>

                        <div className="report-card no-padding">
                            <div className="card-header-row">
                                <h3 className="card-title">Recent Incident Logs</h3>
                            </div>
                            <div className="table-wrapper">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>Severity</th>
                                            <th>Device</th>
                                            <th>Message</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(safeSecurity.recentAlerts || []).map((alert, idx) => (
                                            <tr key={idx}>
                                                <td className="text-gray">{new Date(alert.created_at).toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge badge-${alert.severity}`}>
                                                        {alert.severity.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="font-md">{alert.device_name || 'System'}</td>
                                                <td>{alert.message}</td>
                                                <td className="text-gray capitalize">{alert.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
