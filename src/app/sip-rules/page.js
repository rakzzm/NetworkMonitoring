'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';

export default function SIPRulesPage() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        source_ip: '',
        destination_ip: '',
        port: '',
        action: 'allow',
        priority: 5
    });

    useEffect(() => {
        fetchRules();
    }, []);

    async function fetchRules() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/sip-rules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRules(data);
            }
        } catch (error) {
            console.error('Error fetching SIP rules:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (rule = null) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                name: rule.name,
                source_ip: rule.source_ip,
                destination_ip: rule.destination_ip,
                port: rule.port,
                action: rule.action || 'allow',
                priority: rule.priority || 5
            });
        } else {
            setEditingRule(null);
            setFormData({
                name: '',
                source_ip: '',
                destination_ip: '',
                port: '',
                action: 'allow',
                priority: 5
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
        const url = editingRule ? `/api/sip-rules/${editingRule.id}` : '/api/sip-rules';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    port: parseInt(formData.port),
                    priority: parseInt(formData.priority)
                })
            });

            if (res.ok) {
                fetchRules();
                handleCloseModal();
            } else {
                alert('Error saving SIP rule');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this SIP rule?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/sip-rules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchRules();
            }
        } catch (error) {
            console.error('Error deleting SIP rule:', error);
        }
    };

    return (
        <div id="sip-rules" className="page-section active" style={{ display: 'block' }}>
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{Icons.phone} VoIP (SIP) Traffic Rules</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>+ Add Rule</button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Rule Name</th>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Port</th>
                                <th>Action</th>
                                <th>Priority</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading Rules...</td></tr>
                            ) : rules.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No Rules found</td></tr>
                            ) : (
                                rules.map(rule => (
                                    <tr key={rule.id}>
                                        <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{rule.name}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{rule.source_ip}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{rule.destination_ip}</td>
                                        <td>{rule.port}</td>
                                        <td>
                                            <span className={`status-badge status-${rule.action === 'allow' ? 'active' : 'inactive'}`}>
                                                {rule.action.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{rule.priority}</td>
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
                        <h3>{editingRule ? 'Edit SIP Rule' : 'Add New SIP Rule'}</h3>
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
                                <label>Source IP</label>
                                <input 
                                    type="text" 
                                    value={formData.source_ip}
                                    onChange={(e) => setFormData({...formData, source_ip: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Destination IP</label>
                                <input 
                                    type="text" 
                                    value={formData.destination_ip}
                                    onChange={(e) => setFormData({...formData, destination_ip: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Port</label>
                                <input 
                                    type="number" 
                                    value={formData.port}
                                    onChange={(e) => setFormData({...formData, port: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Action</label>
                                <select 
                                    value={formData.action}
                                    onChange={(e) => setFormData({...formData, action: e.target.value})}
                                >
                                    <option value="allow">Allow</option>
                                    <option value="deny">Deny</option>
                                </select>
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
