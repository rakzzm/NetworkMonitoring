'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function VLANsPage() {
    const [vlans, setVlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVlan, setEditingVlan] = useState(null);
    const [formData, setFormData] = useState({
        vlan_id: '',
        name: '',
        subnet: '',
        gateway: '',
        description: ''
    });

    useEffect(() => {
        fetchVLANs();
    }, []);

    async function fetchVLANs() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/vlans', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setVlans(data);
            }
        } catch (error) {
            console.error('Error fetching VLANs:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (vlan = null) => {
        if (vlan) {
            setEditingVlan(vlan);
            setFormData({
                vlan_id: vlan.vlan_id,
                name: vlan.name,
                subnet: vlan.subnet,
                gateway: vlan.gateway || '',
                description: vlan.description || ''
            });
        } else {
            setEditingVlan(null);
            setFormData({
                vlan_id: '',
                name: '',
                subnet: '',
                gateway: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVlan(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingVlan ? 'PUT' : 'POST';
        const url = editingVlan ? `/api/vlans/${editingVlan.id}` : '/api/vlans';

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
                fetchVLANs();
                handleCloseModal();
            } else {
                alert('Error saving VLAN');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this VLAN?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/vlans/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchVLANs();
            }
        } catch (error) {
            console.error('Error deleting VLAN:', error);
        }
    };

    return (
        <div id="vlans" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{Icons.vlans} VLAN Management</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add VLAN</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>VLAN ID</th>
                                <th>Name</th>
                                <th>Subnet</th>
                                <th>Gateway</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading VLANs...</td></tr>
                            ) : vlans.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No VLANs found</td></tr>
                            ) : (
                                vlans.map(vlan => (
                                    <tr key={vlan.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{vlan.vlan_id}</td>
                                        <td style={{ fontWeight: '500' }}>{vlan.name}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{vlan.subnet}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{vlan.gateway}</td>
                                        <td>{vlan.description}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(vlan)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vlan.id)}>Del</button>
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
                        <h3>{editingVlan ? 'Edit VLAN' : 'Add New VLAN'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>VLAN ID</label>
                                <input 
                                    type="number" 
                                    value={formData.vlan_id}
                                    onChange={(e) => setFormData({...formData, vlan_id: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>VLAN Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Subnet</label>
                                <input 
                                    type="text" 
                                    value={formData.subnet}
                                    onChange={(e) => setFormData({...formData, subnet: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Gateway</label>
                                <input 
                                    type="text" 
                                    value={formData.gateway}
                                    onChange={(e) => setFormData({...formData, gateway: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Description</label>
                                <input 
                                    type="text" 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingVlan ? 'Save Changes' : 'Add VLAN'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
