'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function NetworkDevicesPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'workstation',
        ip_address: '',
        mac_address: '',
        status: 'online',
        location: ''
    });

    useEffect(() => {
        fetchDevices();
    }, []);

    async function fetchDevices() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/network-devices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDevices(data);
            }
        } catch (error) {
            console.error('Error fetching network devices:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (device = null) => {
        if (device) {
            setEditingDevice(device);
            setFormData({
                name: device.name,
                type: device.type,
                ip_address: device.ip_address,
                mac_address: device.mac_address,
                status: device.status || 'online',
                location: device.location || ''
            });
        } else {
            setEditingDevice(null);
            setFormData({
                name: '',
                type: 'workstation',
                ip_address: '',
                mac_address: '',
                status: 'online',
                location: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDevice(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingDevice ? 'PUT' : 'POST';
        const url = editingDevice ? `/api/network-devices/${editingDevice.id}` : '/api/network-devices';

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
                fetchDevices();
                handleCloseModal();
            } else {
                alert('Error saving network device');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this device?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/network-devices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchDevices();
            }
        } catch (error) {
            console.error('Error deleting device:', error);
        }
    };

    return (
        <div id="network-devices" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.devices} Network Devices</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add Device</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Device Name</th>
                                <th>Type</th>
                                <th>IP Address</th>
                                <th>MAC</th>
                                <th>Status</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading Devices...</td></tr>
                            ) : devices.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No Devices found</td></tr>
                            ) : (
                                devices.map(device => (
                                    <tr key={device.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{device.name}</td>
                                        <td>{device.type}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{device.ip_address}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{device.mac_address}</td>
                                        <td>
                                            <span className={`status-badge status-${device.status === 'online' ? 'active' : 'inactive'}`}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td>{device.location}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(device)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(device.id)}>Del</button>
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
                        <h3>{editingDevice ? 'Edit Device' : 'Add New Device'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Device Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Type</label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="workstation">Workstation</option>
                                    <option value="server">Server</option>
                                    <option value="printer">Printer</option>
                                    <option value="camera">IP Camera</option>
                                    <option value="phone">IP Phone</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>IP Address</label>
                                <input 
                                    type="text" 
                                    value={formData.ip_address}
                                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>MAC Address</label>
                                <input 
                                    type="text" 
                                    value={formData.mac_address}
                                    onChange={(e) => setFormData({...formData, mac_address: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingDevice ? 'Save Changes' : 'Add Device'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
