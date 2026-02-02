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
            case 'switch': return Icons.switches;
            case 'router': return Icons.routers;
            case 'client': return Icons.devices;
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
                    <circle cx="20" cy="32" r="3" fill={node.status === 'online' ? '#22c55e' : '#f87171'} />
                    
                    {/* Label */}
                    <text x="20" y="55" fill="#666" fontSize="10" textAnchor="middle" fontWeight="500">
                        {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                    </text>
                </g>
            ))}
        </svg>
    );
};

export default function LANDashboard() {
    const [topology, setTopology] = useState({ nodes: [], links: [] });
    const [stats, setStats] = useState({ switches: 0, clients: 0 });
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
                const res = await fetch('/api/dashboard/topology?view=lan', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setTopology(data);
                    setStats({
                        switches: data.nodes.filter(n => n.type === 'switch').length,
                        clients: data.nodes.filter(n => n.type === 'client').length + 5 // Fake more clients
                    });
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    return (
        <div className="page-section active" style={{ display: 'block' }}>
            <div className="header">
                 <h1 id="pageTitle" style={{fontWeight: '800', letterSpacing: '-1px'}}>LAN Management Dashboard</h1>
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
                        <h3 style={{margin: 0, opacity: 0.7}}>Core Switches</h3>
                        {cloneElement(Icons.switches, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '2.5rem' }}>1</div>
                    <div className="trend" style={{color: '#666'}}>Backbone Online</div>
                </div>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Distribution</h3>
                        {cloneElement(Icons.switches, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '2.5rem' }}>{Math.max(0, stats.switches - 1)}</div>
                    <div className="trend" style={{color: '#666'}}>Edge Switches</div>
                </div>
                <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>VLANs</h3>
                        {cloneElement(Icons.vlans, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '2.5rem' }}>4</div>
                    <div className="trend" style={{color: '#666'}}>Active Segments</div>
                </div>
                 <div className="stat-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                        <h3 style={{margin: 0, opacity: 0.7}}>Connected Clients</h3>
                        {cloneElement(Icons.devices, { width: 32, height: 32, stroke: 'url(#iconGrad)' })}
                    </div>
                    <div className="value count-up" style={{ fontSize: '2.5rem' }}>{stats.clients}</div>
                    <div className="trend" style={{color: '#666'}}>Wired & Wireless</div>
                </div>
            </div>

            <div className="content-card">
                <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
                    {cloneElement(Icons.topology, { width: 24, height: 24, stroke: 'url(#iconGrad)' })} 
                    LAN Topology Map
                </h2>
                <div className="visualization-container" style={{ minHeight: '400px', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {loading ? <div className="loader"></div> : <TopologyMap topology={topology} />}
                </div>
            </div>
        </div>
    );
}
