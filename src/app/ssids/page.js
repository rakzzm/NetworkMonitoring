'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function SSIDsPage() {
    const [ssids, setSsids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSsid, setEditingSsid] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        encryption: 'WPA2',
        vlan_id: '',
        hidden: 0,
        status: 'active'
    });

    useEffect(() => {
        fetchSSIDs();
    }, []);

    async function fetchSSIDs() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ssids', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSsids(data);
            }
        } catch (error) {
            console.error('Error fetching SSIDs:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (ssid = null) => {
        if (ssid) {
            setEditingSsid(ssid);
            setFormData({
                name: ssid.name,
                encryption: ssid.encryption,
                vlan_id: ssid.vlan_id || '',
                hidden: ssid.hidden || 0,
                status: ssid.status || 'active'
            });
        } else {
            setEditingSsid(null);
            setFormData({
                name: '',
                encryption: 'WPA2',
                vlan_id: '',
                hidden: 0,
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSsid(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingSsid ? 'PUT' : 'POST';
        const url = editingSsid ? `/api/ssids/${editingSsid.id}` : '/api/ssids';

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
                fetchSSIDs();
                handleCloseModal();
            } else {
                alert('Error saving SSID');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this SSID?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/ssids/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchSSIDs();
            }
        } catch (error) {
            console.error('Error deleting SSID:', error);
        }
    };

    return (
        <div id="ssids" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.ssids} SSID Management</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add SSID</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>SSID Name</th>
                                <th>Encryption</th>
                                <th>VLAN</th>
                                <th>Hidden</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading SSIDs...</td></tr>
                            ) : ssids.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No SSIDs found</td></tr>
                            ) : (
                                ssids.map(ssid => (
                                    <tr key={ssid.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{ssid.name}</td>
                                        <td>{ssid.encryption}</td>
                                        <td>{ssid.vlan_id || 'Default'}</td>
                                        <td>{ssid.hidden ? 'Yes' : 'No'}</td>
                                        <td>
                                            <span className={`status-badge status-${ssid.status === 'active' ? 'active' : 'inactive'}`}>
                                                {ssid.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(ssid)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ssid.id)}>Del</button>
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
                        <h3>{editingSsid ? 'Edit SSID' : 'Add New SSID'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>SSID Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Encryption</label>
                                <select 
                                    value={formData.encryption}
                                    onChange={(e) => setFormData({...formData, encryption: e.target.value})}
                                >
                                    <option value="WPA2">WPA2</option>
                                    <option value="WPA3">WPA3</option>
                                    <option value="Open">Open</option>
                                </select>
                            </div>
                            {!editingSsid && (
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label>Password</label>
                                    <input 
                                        type="password" 
                                        value={formData.password || ''}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            )}
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>VLAN ID</label>
                                <input 
                                    type="text" 
                                    value={formData.vlan_id}
                                    onChange={(e) => setFormData({...formData, vlan_id: e.target.value})}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.hidden === 1}
                                        onChange={(e) => setFormData({...formData, hidden: e.target.checked ? 1 : 0})}
                                        style={{ marginRight: '10px', width: 'auto' }}
                                    />
                                    Hidden SSID
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingSsid ? 'Save Changes' : 'Add SSID'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
