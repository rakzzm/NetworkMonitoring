'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function SwitchesPage() {
    const [switches, setSwitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSwitch, setEditingSwitch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        mac_address: '',
        ports: '24',
        location: ''
    });

    useEffect(() => {
        fetchSwitches();
    }, []);

    const fetchSwitches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/switches', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSwitches(data);
            }
        } catch (error) {
            console.error('Failed to fetch switches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (sw = null) => {
        if (sw) {
            setEditingSwitch(sw);
            setFormData({
                name: sw.name,
                ip_address: sw.ip_address,
                mac_address: sw.mac_address,
                ports: sw.ports || sw.port_count || '24',
                location: sw.location
            });
        } else {
            setEditingSwitch(null);
            setFormData({
                name: '',
                ip_address: '',
                mac_address: '',
                ports: '24',
                location: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSwitch(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingSwitch ? 'PUT' : 'POST';
        const url = editingSwitch ? `/api/switches/${editingSwitch.id}` : '/api/switches';

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
                fetchSwitches();
                handleCloseModal();
            } else {
                alert('Error saving switch');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this switch?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/switches/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchSwitches();
            }
        } catch (error) {
            console.error('Error deleting switch:', error);
        }
    };

    return (
        <div id="switches" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{Icons.switches} Switch Management</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add Switch</button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>IP Address</th>
                                <th>MAC Address</th>
                                <th>Ports</th>
                                <th>PoE Ports</th>
                                <th>VLAN Support</th>
                                <th>Status</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : switches.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center' }}>No switches found</td></tr>
                            ) : (
                                switches.map(sw => (
                                    <tr key={sw.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{sw.name}</td>
                                        <td>{sw.ip_address}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{sw.mac_address}</td>
                                        <td>{sw.ports || sw.port_count}</td>
                                        <td>{sw.poe_ports || 0}</td>
                                        <td>{sw.vlan_support || 'Yes'}</td>
                                        <td><span className={`status-badge status-${sw.status === 'online' ? 'active' : 'inactive'}`}>{sw.status}</span></td>
                                        <td>{sw.location}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(sw)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sw.id)}>Del</button>
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
                        <h3>{editingSwitch ? 'Edit Switch' : 'Add New Switch'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Switch Name</label>
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
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Ports</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.ports}
                                    onChange={(e) => setFormData({...formData, ports: e.target.value})}
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
                            <button type="submit" className="btn btn-primary">{editingSwitch ? 'Save Changes' : 'Add Switch'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
