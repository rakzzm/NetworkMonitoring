'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    async function markRead(id) {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div id="notifications" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.notifications} System Notifications</h2>
                    <button className="btn btn-primary btn-sm" onClick={fetchNotifications}>Refresh</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Device</th>
                                <th>Message</th>
                                <th>Severity</th>
                                <th>Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading Notifications...</td></tr>
                            ) : notifications.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No Notifications</td></tr>
                            ) : (
                                notifications.map(n => (
                                    <tr key={n.id} style={{ background: n.is_read ? 'transparent' : 'rgba(255,184,0,0.05)' }}>
                                        <td>{n.type}</td>
                                        <td>{n.device_name || 'System'}</td>
                                        <td>{n.message}</td>
                                        <td>
                                            <span className={`status-badge status-${n.severity === 'error' ? 'inactive' : 'info'}`}>
                                                {n.severity}
                                            </span>
                                        </td>
                                        <td>{new Date(n.created_at).toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {!n.is_read && <button className="btn btn-sm btn-primary" onClick={() => markRead(n.id)}>Mark Read</button>}
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
