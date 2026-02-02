'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function RoutersPage() {
    const [routers, setRouters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRouter, setEditingRouter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        mac_address: '',
        firmware_version: 'v2.4.1',
        location: ''
    });

    useEffect(() => {
        fetchRouters();
    }, []);

    const fetchRouters = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/routers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRouters(data);
            }
        } catch (error) {
            console.error('Failed to fetch routers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (router = null) => {
        if (router) {
            setEditingRouter(router);
            setFormData({
                name: router.name,
                ip_address: router.ip_address,
                mac_address: router.mac_address,
                firmware_version: router.firmware_version,
                location: router.location
            });
        } else {
            setEditingRouter(null);
            setFormData({
                name: '',
                ip_address: '',
                mac_address: '',
                firmware_version: 'v2.4.1',
                location: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRouter(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingRouter ? 'PUT' : 'POST';
        const url = editingRouter ? `/api/routers/${editingRouter.id}` : '/api/routers';

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
                fetchRouters();
                handleCloseModal();
            } else {
                alert('Error saving router');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this router?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/routers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchRouters();
            }
        } catch (error) {
            console.error('Error deleting router:', error);
        }
    };

    return (
        <div id="routers" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{Icons.routers} Router Management</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add Router</button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>IP Address</th>
                                <th>MAC Address</th>
                                <th>Firmware</th>
                                <th>Status</th>
                                <th>Location</th>
                                <th>CPU</th>
                                <th>Memory</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : routers.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center' }}>No routers found</td></tr>
                            ) : (
                                routers.map(router => (
                                    <tr key={router.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{router.name}</td>
                                        <td>{router.ip_address}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{router.mac_address}</td>
                                        <td><span className="badge" style={{ background: '#444', color: '#ccc' }}>{router.firmware_version}</span></td>
                                        <td><span className={`status-badge status-${router.status === 'online' ? 'active' : 'inactive'}`}>{router.status}</span></td>
                                        <td>{router.location}</td>
                                        <td>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: router.cpu_load + '%', background: router.cpu_load > 80 ? '#ff4444' : '#00fa9a' }}></div>
                                            </div>
                                            <span style={{ fontSize: '10px' }}>{router.cpu_load}%</span>
                                        </td>
                                        <td>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: router.memory_usage + '%', background: '#00bfff' }}></div>
                                            </div>
                                            <span style={{ fontSize: '10px' }}>{router.memory_usage}%</span>
                                        </td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(router)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(router.id)}>Del</button>
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
                        <h3>{editingRouter ? 'Edit Router' : 'Add New Router'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Router Name</label>
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
                            <button type="submit" className="btn btn-primary">{editingRouter ? 'Save Changes' : 'Add Router'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
