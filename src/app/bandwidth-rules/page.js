'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function BandwidthRulesPage() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        download_speed: '',
        upload_speed: '',
        priority: 5,
        description: ''
    });

    useEffect(() => {
        fetchRules();
    }, []);

    async function fetchRules() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/bandwidth-rules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRules(data);
            }
        } catch (error) {
            console.error('Error fetching bandwidth rules:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (rule = null) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                name: rule.name,
                download_speed: rule.download_speed,
                upload_speed: rule.upload_speed,
                priority: rule.priority,
                description: rule.description || ''
            });
        } else {
            setEditingRule(null);
            setFormData({
                name: '',
                download_speed: '',
                upload_speed: '',
                priority: 5,
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRule(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = editingRule ? 'PUT' : 'POST';
        const url = editingRule ? `/api/bandwidth-rules/${editingRule.id}` : '/api/bandwidth-rules';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    download_speed: parseInt(formData.download_speed),
                    upload_speed: parseInt(formData.upload_speed),
                    priority: parseInt(formData.priority)
                })
            });

            if (res.ok) {
                fetchRules();
                handleCloseModal();
            } else {
                alert('Error saving rule');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/bandwidth-rules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchRules();
            }
        } catch (error) {
            console.error('Error deleting rule:', error);
        }
    };

    return (
        <div id="bandwidth-rules" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.bandwidth} Bandwidth Rules</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add Rule</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Rule Name</th>
                                <th>Download (Mbps)</th>
                                <th>Upload (Mbps)</th>
                                <th>Priority</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading Rules...</td></tr>
                            ) : rules.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No Rules found</td></tr>
                            ) : (
                                rules.map(rule => (
                                    <tr key={rule.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{rule.name}</td>
                                        <td>{rule.download_speed}</td>
                                        <td>{rule.upload_speed}</td>
                                        <td>{rule.priority}</td>
                                        <td>{rule.description}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" style={{ marginRight: '5px' }} onClick={() => handleOpenModal(rule)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rule.id)}>Del</button>
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
                        <h3>{editingRule ? 'Edit Rule' : 'Add New Rule'}</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Rule Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Download Speed (Mbps)</label>
                                <input 
                                    type="number" 
                                    value={formData.download_speed}
                                    onChange={(e) => setFormData({...formData, download_speed: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Upload Speed (Mbps)</label>
                                <input 
                                    type="number" 
                                    value={formData.upload_speed}
                                    onChange={(e) => setFormData({...formData, upload_speed: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Priority (1-10)</label>
                                <input 
                                    type="number" 
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    min="1"
                                    max="10"
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
                            <button type="submit" className="btn btn-primary">{editingRule ? 'Save Changes' : 'Add Rule'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
