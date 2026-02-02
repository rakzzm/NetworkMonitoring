'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/Icons';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    // Navigation Data Structure
    const menuItems = [
        { 
            id: 'main',
            label: 'Main',
            subItems: [
                { label: 'Dashboard', path: '/', icon: Icons.dashboard },
            ]
        },
        { 
            id: 'wan', 
            label: 'WAN / Wireless', 
            subItems: [
                { label: 'WAN Dashboard', path: '/wan', icon: Icons.dashboard },
                { label: 'Routers', path: '/routers', icon: Icons.routers },
                { label: 'Access Points', path: '/access-points', icon: Icons.ap },
                { label: 'SSIDs', path: '/ssids', icon: Icons.ssids },
            ] 
        },
        { 
            id: 'lan', 
            label: 'LAN Management', 
            subItems: [
                { label: 'LAN Dashboard', path: '/lan', icon: Icons.dashboard },
                { label: 'Switches', path: '/switches', icon: Icons.switches },
                { label: 'VLANs', path: '/vlans', icon: Icons.vlans },
                { label: 'Devices', path: '/network-devices', icon: Icons.devices },
            ] 
        },
        { 
            id: 'traffic', 
            label: 'Traffic & Security', 
            subItems: [
                { label: 'Bandwidth', path: '/bandwidth-rules', icon: Icons.bandwidth },
                { label: 'Hotspot Users', path: '/hotspot-users', icon: Icons.users },
                { label: 'Captive Portal', path: '/captive-portal', icon: Icons.lock },
                { label: 'SIP Rules', path: '/sip-rules', icon: Icons.phone },
            ] 
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            subItems: [
                { label: 'Reports', path: '/reports', icon: Icons.reports },
            ] 
        },
        { 
            id: 'system', 
            label: 'System', 
            subItems: [
                { label: 'Settings', path: '/settings', icon: Icons.settings },
                { label: 'Logs', path: '/traffic-logs', icon: Icons.logs },
                { label: 'Troubleshoot', path: '/troubleshooting', icon: Icons.troubleshoot },
                { label: 'Notifications', path: '/notifications', icon: Icons.notifications },
            ] 
        },
    ];

    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        const width = isCollapsed ? '90px' : '260px';
        document.documentElement.style.setProperty('--sidebar-width', width);
    }, [isCollapsed]);

    if (pathname === '/login') return null;

    return (
        <div className="sidebar-container">
            <div className={`sidebar-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }}>
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                <div className="sidebar-header">
                    <div className="logo-icon">
                        <img src="/logo-icon.svg" alt="NetManager" width="40" height="40" />
                    </div>
                    <h2 className="logo-text">NetManager</h2>
                </div>

                <div className="sidebar-scroll">
                    {menuItems.map((group) => (
                        <div key={group.id} className="menu-group">
                            <div className="group-label">{group.label}</div>
                            {group.subItems.map((item, idx) => (
                                <Link key={idx} href={item.path}>
                                    <div className={`nav-item ${pathname === item.path ? 'active' : ''}`}>
                                        <div className="icon">{item.icon}</div>
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                 {/* Global Gradient Defs for Icons */}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1e3a8a" />
                            <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}
