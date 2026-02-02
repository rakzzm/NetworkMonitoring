
'use client';

import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('availability'); // availability, performance, traffic, security
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports')
            .then(res => res.json())
            .then(resData => {
                setData(resData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch reports:", err);
                setLoading(false);
            });
    }, []);

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
        { name: 'Routers', value: data.availability.routers },
        { name: 'Switches', value: data.availability.switches },
        { name: 'Access Points', value: data.availability.accessPoints },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Analytics & Reports</h1>
                    <p className="text-gray-500">Enterprise Network Insights & Historical Analysis</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('PDF')} className="btn btn-secondary flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Export PDF
                    </button>
                    <button onClick={() => handleExport('CSV')} className="btn btn-secondary flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Reporting Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button className={`pb-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'availability' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('availability')}>Availability & Uptime</button>
                <button className={`pb-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('performance')}>Performance & Health</button>
                <button className={`pb-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'traffic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('traffic')}>Bandwidth & Traffic</button>
                <button className={`pb-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('security')}>Security & Compliance</button>
            </div>

            {/* Content Area */}
            <div className="animate-fadeIn">
                
                {activeTab === 'availability' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium">Overall Network Uptime</h3>
                                <div className="text-4xl font-bold text-green-500 mt-2">{data.availability.overall}%</div>
                                <div className="text-xs text-gray-400 mt-1">SLA Target: 99.99%</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium">Downtime (Last 30 Days)</h3>
                                <div className="text-4xl font-bold text-gray-800 mt-2">4m 32s</div>
                                <div className="text-xs text-green-500 mt-1">Within acceptable limits</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium">MTTR (Mean Time To Repair)</h3>
                                <div className="text-4xl font-bold text-blue-500 mt-2">12m</div>
                                <div className="text-xs text-gray-400 mt-1">Average response time</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-6">Device Availability breakdown</h3>
                            <div className="h-80 w-full">
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
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-6">Router Hardware Health (CPU & Memory)</h3>
                            <div className="h-96 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.performance.routers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4">Network Latency (Avg ms)</h3>
                                {/* Mocked Area Chart for Trend */}
                                <div className="h-64">
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
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4">Packet Loss (%)</h3>
                                <div className="h-64 flex items-center justify-center flex-col">
                                    <div className="radial-progress text-primary" style={{"--value":0.05, "--size": "12rem"}}>0.05%</div>
                                    <p className="text-gray-500 mt-4">Average Packet Loss</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'traffic' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-6">Traffic by Protocol</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.traffic.byProtocol}
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
                                                {data.traffic.byProtocol.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val) => `${(val / 1024 / 1024).toFixed(2)} MB`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-6">Top Talkers (Source IPs)</h3>
                                <div className="h-80">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.traffic.topTalkers} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
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
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                                <h3 className="text-gray-500 text-sm font-medium">Critical Alerts</h3>
                                <div className="text-3xl font-bold text-red-500 mt-2">{data.security.criticalAlerts}</div>
                                <div className="text-xs text-gray-400 mt-1">Requires immediate attention</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
                                <h3 className="text-gray-500 text-sm font-medium">Warning Events</h3>
                                <div className="text-3xl font-bold text-yellow-500 mt-2">{data.security.warningAlerts}</div>
                                <div className="text-xs text-gray-400 mt-1">Potential issues detected</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                                <h3 className="text-gray-500 text-sm font-medium">Policy Compliance</h3>
                                <div className="text-3xl font-bold text-green-500 mt-2">98.5%</div>
                                <div className="text-xs text-gray-400 mt-1">PCI-DSS / HIPAA Ready</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-semibold text-gray-800">Recent Incident Logs</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                            <th className="px-6 py-3 font-medium">Timestamp</th>
                                            <th className="px-6 py-3 font-medium">Severity</th>
                                            <th className="px-6 py-3 font-medium">Device</th>
                                            <th className="px-6 py-3 font-medium">Message</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.security.recentAlerts.map((alert, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 text-gray-500">{new Date(alert.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                                                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {alert.severity.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{alert.device_name || 'System'}</td>
                                                <td className="px-6 py-3 text-gray-700">{alert.message}</td>
                                                <td className="px-6 py-3 text-gray-500 capitalize">{alert.status}</td>
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
