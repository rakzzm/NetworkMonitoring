'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function AccessPointsPage() {
    const [aps, setAps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAp, setEditingAp] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        mac_address: '',
        ssid: 'NetManager_WiFi',
        location: ''
    });

    useEffect(() => {
        fetchAPs();
    }, []);

    const fetchAPs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/access-points', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAps(data);
            }
        } catch (error) {
            console.error('Failed to fetch APs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (ap = null) => {
        if (ap) {
            setEditingAp(ap);
            setFormData({
                name: ap.name,
                ip_address: ap.ip_address,
                mac_address: ap.mac_address,
                ssid: ap.ssid,
                location: ap.location || ''
            });
        } else {
            setEditingAp(null);
            setFormData({
                name: '',
                ip_address: '',
                mac_address: '',
                ssid: 'NetManager_WiFi',
                location: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAp(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingAp ? 'PUT' : 'POST';
        const url = editingAp ? `/api/access-points/${editingAp.id}` : '/api/access-points';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchAPs();
                handleCloseModal();
            } else {
                alert('Error saving access point');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this access point?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/access-points/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchAPs();
            }
        } catch (error) {
            console.error('Error deleting AP:', error);
        }
    };

    return (
        <div id="access-points" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{Icons.ap} Access Point Management</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add AP</button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>IP Address</th>
                                <th>MAC Address</th>
                                <th>SSID</th>
                                <th>Status</th>
                                <th>Signal</th>
                                <th>Clients</th>
                                <th>Channel</th>
                                <th>Frequency</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : aps.length === 0 ? (
                                <tr><td colSpan="10" style={{ textAlign: 'center' }}>No APs found</td></tr>
                            ) : (
                                aps.map(ap => (
                                    <tr key={ap.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{ap.name}</td>
                                        <td>{ap.ip_address}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{ap.mac_address}</td>
                                        <td>{ap.ssid}</td>
                                        <td><span className={`status-badge status-${ap.status === 'online' ? 'active' : 'inactive'}`}>{ap.status}</span></td>
                                        <td>{ap.signal_strength || -45} dBm</td>
                                        <td>{ap.connected_clients || 0}</td>
                                        <td>{ap.channel || 6}</td>
                                        <td>{ap.frequency || '2.4 GHz'}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(ap)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ap.id)}>Del</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
                <div className="modal">
                    <div className="modal-header">
                        <h3>{editingAp ? 'Edit Access Point' : 'Add New Access Point'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>AP Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>IP Address</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.ip_address}
                                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>MAC Address</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.mac_address}
                                    onChange={(e) => setFormData({...formData, mac_address: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>SSID</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.ssid}
                                    onChange={(e) => setFormData({...formData, ssid: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Location</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingAp ? 'Save Changes' : 'Add Access Point'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
