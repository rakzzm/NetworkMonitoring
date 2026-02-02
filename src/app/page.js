'use client';

import { useEffect, useState, cloneElement } from 'react';
import { Icons } from '@/components/Icons';

// SVG Traffic Chart
const TrafficChart = ({ traffic }) => {
    if (!traffic || !traffic.length) return null;
    const width = 500;
    const height = 200;
    const padding = 40;
    const maxVal = Math.max(...traffic.map(d => Math.max(d.download, d.upload))) * 1.2 || 100;

    const getX = (i) => padding + (i * (width - 2 * padding) / (traffic.length - 1));
    const getY = (val) => height - padding - (val / maxVal * (height - 2 * padding));

    const downloadPath = traffic.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.download)}`).join(' ');
    const uploadPath = traffic.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.upload)}`).join(' ');

    return (
        <svg width="100%" height="220" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                </linearGradient>
            </defs>
            
            {/* Horizontal Grid & Labels */}
            {[0, 0.5, 1].map((v, i) => {
                const y = getY(v * maxVal);
                if (!isNaN(y)) {
                        return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeDasharray="4,4" />
                            <text x={padding - 10} y={y + 4} fill="#666" fontSize="10" textAnchor="end">
                                {Math.round(v * maxVal)}
                            </text>
                        </g>
                    );
                }
                return null;
            })}
            
            {/* Vertical Axes */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(0,0,0,0.1)" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(0,0,0,0.1)" />
            
            {/* Areas */}
            <path d={`${downloadPath} L ${getX(traffic.length-1)} ${height-padding} L ${padding} ${height-padding} Z`} fill="url(#downloadGrad)" />
            <path d={`${uploadPath} L ${getX(traffic.length-1)} ${height-padding} L ${padding} ${height-padding} Z`} fill="url(#uploadGrad)" />
            
            {/* Lines */}
            <path d={downloadPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={uploadPath} fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Legend labels */}
            <text x={30} y={padding - 15} fill="#666" fontSize="10" textAnchor="middle">Mbps</text>
            <text x={width - padding} y={height - padding + 15} fill="#666" fontSize="10" textAnchor="end">Time (Last 20m)</text>
        </svg>
    );
};

// SVG Topology Map
const TopologyMap = ({ topology }) => {
    if (!topology || !topology.nodes.length) return null;
    const width = 800;
    const height = 500;

    const getIcon = (type) => {
        switch(type) {
            case 'cloud': return Icons.dashboard;
            case 'router': return Icons.routers;
            case 'switch': return Icons.switches;
            case 'ap': return Icons.ap;
            default: return Icons.devices;
        }
    };

    return (
        <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
            <defs>
                <filter id="nodeGlow">
                    <feGaussianBlur stdDeviation="3" result="glow"/>
                    <feMerge>
                        <feMergeNode in="glow"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            {/* Links */}
            {topology.links.map((link, i) => {
                const source = topology.nodes.find(n => n.id === link.source);
                const target = topology.nodes.find(n => n.id === link.target);
                if (!source || !target) return null;
                return (
                    <line key={i} x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                            stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeDasharray="4,4">
                        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="1s" repeatCount="indefinite" />
                    </line>
                );
            })}
            {/* Nodes */}
            {topology.nodes.map(node => (
                <g key={node.id} transform={`translate(${node.x - 25}, ${node.y - 25})`}>
                    {/* Background Card */}
                    <rect width="50" height="50" rx="8" fill="white" stroke="#e0e0e0" strokeWidth="1" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
                    
                    {/* Icon - Centered and Sized Correctly */}
                    {cloneElement(getIcon(node.type), { 
                        width: 24, 
                        height: 24, 
                        x: 13, 
                        y: 10,
                        stroke: node.status === 'online' ? '#22c55e' : '#666',
                        color: node.status === 'online' ? '#22c55e' : '#666'
                    })}

                    {/* Status Indicator */}
                    <circle cx="25" cy="40" r="3" fill={node.status === 'online' || node.type === 'cloud' ? '#22c55e' : '#f87171'} />
                    
                    {/* Label */}
                    <text x="25" y="65" fill="#666" fontSize="10" textAnchor="middle" fontWeight="500">
                        {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                    </text>
                </g>
            ))}
        </svg>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalRouters: 0,
        onlineDevices: 0,
        totalUsers: 0,
        bandwidthUsed: 0
    });
    const [alerts, setAlerts] = useState([]);
    const [topology, setTopology] = useState({ nodes: [], links: [] });
    const [traffic, setTraffic] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const fetchData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                
                // Fetch stats
                const statsRes = await fetch('/api/dashboard/stats', { headers });
                if (statsRes.ok) setStats(await statsRes.json());

                // Fetch alerts
                const alertsRes = await fetch('/api/notifications', { headers });
                if (alertsRes.ok) {
                    const data = await alertsRes.json();
                    setAlerts(data.slice(0, 5));
                }

                // Fetch topology
                const topoRes = await fetch('/api/dashboard/topology', { headers });
                if (topoRes.ok) setTopology(await topoRes.json());

                // Fetch traffic
                const trafficRes = await fetch('/api/dashboard/traffic', { headers });
                if (trafficRes.ok) setTraffic(await trafficRes.json());

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // More frequent updates for smooth feel
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="dashboard" className="page-section active" style={{ display: 'block' }}>
            <div className="header">
                    <h1 id="pageTitle" style={{fontWeight: '800', letterSpacing: '-1px'}}>Dashboard Overview</h1>
                    <div className="header-actions">
                        <div className="search-box">
                            <span style={{color: '#3b82f6', display: 'flex', alignItems: 'center'}}>{cloneElement(Icons.search, { width: 20, height: 20 })}</span>
                            <input type="text" placeholder="Search..." id="globalSearch" />
                        </div>
                        <div className="user-info">
                            <div className="user-avatar" id="userAvatar" style={{ background: 'var(--text-gradient)', color: 'white' }}>A</div>
                            <span id="userName" style={{fontWeight: '600', color: 'var(--text-primary)'}}>Admin</span>
                        </div>
                        <button className="btn btn-danger btn-sm" style={{borderRadius: '10px', padding: '10px 20px'}} onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login'; 
                        }}>Logout</button>
                    </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Total Routers</h3>
                        {cloneElement(Icons.routers, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" id="statRouters" style={{ fontSize: '2.5rem' }}>{stats.totalRouters}</div>
                    <div className="trend" style={{color: '#666'}}>System wide</div>
                </div>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Online Devices</h3>
                        {cloneElement(Icons.online, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" id="statOnline" style={{ fontSize: '2.5rem' }}>{stats.onlineDevices}</div>
                    <div className="trend" style={{color: '#666'}}>Currently connected</div>
                </div>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Active Users</h3>
                        {cloneElement(Icons.users, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" id="statUsers" style={{ fontSize: '2.5rem' }}>{stats.totalUsers}</div>
                    <div className="trend" style={{color: '#666'}}>Hotspot users</div>
                </div>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Bandwidth Usage</h3>
                        {cloneElement(Icons.bandwidth, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" id="statBandwidth" style={{ fontSize: '2.5rem' }}>{(stats.bandwidthUsed / (1024 * 1024 * 1024)).toFixed(2)} GB</div>
                    <div className="trend" style={{color: '#666'}}>Simulated Real-time</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="content-card">
                    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>{cloneElement(Icons.topology, { width: 24, height: 24, stroke: 'url(#iconGrad)' })} Network Overview</h2>
                    <div className="visualization-container" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)' }}>
                        {loading ? <div className="loader"></div> : <TopologyMap topology={topology} />}
                    </div>
                </div>
                <div className="content-card">
                    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>{cloneElement(Icons.chart, { width: 24, height: 24, stroke: 'url(#iconGrad)' })} Traffic Summary</h2>
                    <div className="visualization-container" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {loading ? <div className="loader"></div> : (
                            <>
                                <TrafficChart traffic={traffic} />
                                <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                        <span style={{ color: '#666' }}>Download</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#ec4899', borderRadius: '2px' }}></div>
                                        <span style={{ color: '#666' }}>Upload</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="content-card">
                <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {cloneElement(Icons.notifications, { width: 24, height: 24, stroke: 'url(#iconGrad)' })}
                    Recent Alerts
                </h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Device</th>
                                <th>Type</th>
                                <th>Message</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="alertsTable">
                            {alerts.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No recent alerts</td></tr>
                            ) : (
                                alerts.map(alert => (
                                    <tr key={alert.id}>
                                        <td>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{alert.device_name || 'System'}</td>
                                        <td>{alert.type}</td>
                                        <td>{alert.message}</td>
                                        <td>
                                            <span className={`status-badge status-${alert.severity === 'error' ? 'inactive' : 'warning'}`}>
                                                {alert.severity}
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
