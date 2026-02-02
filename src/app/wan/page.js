'use client';

import { useEffect, useState, cloneElement } from 'react';
import { Icons } from '@/components/Icons';

// SVG Topology Map
const TopologyMap = ({ topology }) => {
    if (!topology || !topology.nodes.length) return null;
    const width = 800;
    const height = 500;

    const getIcon = (type) => {
        switch(type) {
            case 'cloud': return Icons.dashboard; // Proxy for cloud/internet
            case 'router': return Icons.routers;
            case 'switch': return Icons.switches;
            case 'ap': return Icons.ap;
            default: return Icons.devices;
        }
    };

    return (
        <svg width="100%" height="400" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
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
                <g key={node.id} transform={`translate(${node.x - 20}, ${node.y - 20})`}>
                    {/* Background Card */}
                    <rect width="40" height="40" rx="8" fill="white" stroke="#e0e0e0" strokeWidth="1" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
                    
                    {/* Icon - Centered and Sized Correctly */}
                    {cloneElement(getIcon(node.type), { 
                        width: 20, 
                        height: 20, 
                        x: 10, 
                        y: 10,
                        stroke: node.status === 'online' ? '#22c55e' : '#666',
                        color: node.status === 'online' ? '#22c55e' : '#666'
                    })}

                    {/* Status Indicator */}
                    <circle cx="20" cy="32" r="3" fill={node.status === 'online' || node.type === 'cloud' ? '#22c55e' : '#f87171'} />
                    
                    {/* Label */}
                    <text x="20" y="55" fill="#666" fontSize="10" textAnchor="middle" fontWeight="500">
                        {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                    </text>
                </g>
            ))}
        </svg>
    );
};

export default function WANDashboard() {
    const [topology, setTopology] = useState({ nodes: [], links: [] });
    const [stats, setStats] = useState({ routers: 0, aps: 0, speed: 0 });
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
                const res = await fetch('/api/dashboard/topology?view=wan', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setTopology(data);
                    setStats({
                        routers: data.nodes.filter(n => n.type === 'router').length,
                        aps: data.nodes.filter(n => n.type === 'ap').length,
                        speed: Math.floor(Math.random() * 500 + 500) // Sim simulated speed
                    });
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    return (
        <div className="page-section active" style={{ display: 'block' }}>
            <div className="header">
                 <h1 id="pageTitle" style={{fontWeight: '800', letterSpacing: '-1px'}}>WAN & Wireless Dashboard</h1>
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
                        <h3 style={{margin: 0, opacity: 0.7}}>Internet Status</h3>
                        {cloneElement(Icons.online, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '1.5rem', color: '#22c55e' }}>Connected</div>
                    <div className="trend" style={{color: '#666'}}>ISP: FiberLink</div>
                </div>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Total Routers</h3>
                        {cloneElement(Icons.routers, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '2.5rem' }}>{stats.routers}</div>
                    <div className="trend" style={{color: '#666'}}>Gateway & Edge</div>
                </div>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Total APs</h3>
                        {cloneElement(Icons.ap, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '2.5rem' }}>{stats.aps}</div>
                    <div className="trend" style={{color: '#666'}}>Wireless Zones</div>
                </div>
                 <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Avg Speed</h3>
                        {cloneElement(Icons.bandwidth, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '2.5rem' }}>{stats.speed} Mbps</div>
                    <div className="trend" style={{color: '#666'}}>Real-time throughput</div>
                </div>
            </div>

            <div className="content-card">
                <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
                    {cloneElement(Icons.topology, { width: 24, height: 24, stroke: 'url(#iconGrad)' })} 
                    WAN Topology Map
                </h2>
                <div className="visualization-container" style={{ minHeight: '400px', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {loading ? <div className="loader"></div> : <TopologyMap topology={topology} />}
                </div>
            </div>
        </div>
    );
}
