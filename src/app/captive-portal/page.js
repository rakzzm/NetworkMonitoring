'use client';

import { useEffect, useState } from 'react';

export default function CaptivePortalPage() {
    const [portals, setPortals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPortal, setEditingPortal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        welcome_message: '',
        redirect_url: '',
        authentication_type: 'radius',
        status: 'active'
    });

    useEffect(() => {
        fetchPortals();
    }, []);

    async function fetchPortals() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/captive-portal', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPortals(data);
            }
        } catch (error) {
            console.error('Error fetching captive portals:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (portal = null) => {
        if (portal) {
            setEditingPortal(portal);
            setFormData({
                name: portal.name,
                welcome_message: portal.welcome_message,
                redirect_url: portal.redirect_url || '',
                authentication_type: portal.authentication_type || 'radius',
                status: portal.status || 'active'
            });
        } else {
            setEditingPortal(null);
            setFormData({
                name: '',
                welcome_message: '',
                redirect_url: '',
                authentication_type: 'radius',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPortal(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingPortal ? 'PUT' : 'POST';
        const url = editingPortal ? `/api/captive-portal/${editingPortal.id}` : '/api/captive-portal';

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
                fetchPortals();
                handleCloseModal();
            } else {
                alert('Error saving captive portal');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this captive portal?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/captive-portal/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchPortals();
            }
        } catch (error) {
            console.error('Error deleting captive portal:', error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>Captive Portal</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add Portal</button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Portal Name</th>
                                <th>Auth Type</th>
                                <th>Welcome Message</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading Portals...</td></tr>
                            ) : portals.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No Portals found</td></tr>
                            ) : (
                                portals.map(portal => (
                                    <tr key={portal.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{portal.name}</td>
                                        <td>{portal.authentication_type}</td>
                                        <td>{portal.welcome_message}</td>
                                        <td>
                                            <span className={`status-badge status-${portal.status === 'active' ? 'active' : 'inactive'}`}>
                                                {portal.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(portal)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(portal.id)}>Del</button>
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
                        <h3>{editingPortal ? 'Edit Captive Portal' : 'Add New Captive Portal'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Portal Name</label>
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
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Welcome Message</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.welcome_message}
                                    onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Redirect URL</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.redirect_url}
                                    onChange={(e) => setFormData({...formData, redirect_url: e.target.value})}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>Authentication Type</label>
                                <select 
                                    className="form-control" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '5px' }}
                                    value={formData.authentication_type}
                                    onChange={(e) => setFormData({...formData, authentication_type: e.target.value})}
                                >
                                    <option value="radius">RADIUS</option>
                                    <option value="local">Local Database</option>
                                    <option value="none">No Authentication</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingPortal ? 'Save Changes' : 'Add Portal'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
