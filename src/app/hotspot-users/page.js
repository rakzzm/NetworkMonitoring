'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function HotspotUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        profile: 'default',
        data_limit: '',
        time_limit: '',
        status: 'active'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hotspot-users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching hotspot users:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: user.password,
                profile: user.profile,
                data_limit: user.data_limit || '',
                time_limit: user.time_limit || '',
                status: user.status || 'active'
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                profile: 'default',
                data_limit: '',
                time_limit: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser ? `/api/hotspot-users/${editingUser.id}` : '/api/hotspot-users';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    data_limit: formData.data_limit ? parseInt(formData.data_limit) : null,
                    time_limit: formData.time_limit ? parseInt(formData.time_limit) : null
                })
            });

            if (res.ok) {
                fetchUsers();
                handleCloseModal();
            } else {
                alert('Error saving hotspot user');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this hotspot user?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/hotspot-users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting hotspot user:', error);
        }
    };

    return (
        <div id="hotspot-users" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.users} Hotspot Users</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add User</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Profile</th>
                                <th>Data Limit</th>
                                <th>Time Limit</th>
                                <th>Status</th>
                                <th>Expires</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading Users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No Users found</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{user.username}</td>
                                        <td>{user.profile}</td>
                                        <td>{user.data_limit ? user.data_limit + ' MB' : 'Unlimited'}</td>
                                        <td>{user.time_limit ? user.time_limit + ' Min' : 'Unlimited'}</td>
                                        <td>
                                            <span className={`status-badge status-${user.status === 'active' ? 'active' : 'inactive'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>{user.expire_date ? new Date(user.expire_date).toLocaleDateString() : 'Never'}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(user)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>Del</button>
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
                        <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Password</label>
                                <input 
                                    type="text" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Profile</label>
                                <select 
                                    value={formData.profile}
                                    onChange={(e) => setFormData({...formData, profile: e.target.value})}
                                >
                                    <option value="default">Default</option>
                                    <option value="premium">Premium</option>
                                    <option value="guest">Guest</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Data Limit (MB)</label>
                                <input 
                                    type="number" 
                                    value={formData.data_limit}
                                    onChange={(e) => setFormData({...formData, data_limit: e.target.value})}
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Time Limit (Minutes)</label>
                                <input 
                                    type="number" 
                                    value={formData.time_limit}
                                    onChange={(e) => setFormData({...formData, time_limit: e.target.value})}
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingUser ? 'Save Changes' : 'Add User'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
