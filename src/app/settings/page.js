'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import Modal from '@/components/Modal';

const TabButton = ({ id, label, icon, activeTab, setActiveTab }) => (
    <button 
        className={`btn ${activeTab === id ? 'btn-primary' : 'btn-secondary'}`} 
        onClick={() => setActiveTab(id)}
        style={{ 
            marginRight: '10px', 
            marginBottom: '10px',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            opacity: activeTab === id ? 1 : 0.7 
        }}
    >
        {icon && <span style={{width: '16px'}}>{icon}</span>}
        {label}
    </button>
);

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    
    // User Management State
    const [users, setUsers] = useState([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    
    // Modal states
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);

    const [apiKey, setApiKey] = useState('nm_live_8f92k20s93j29s0');
    const [notification, setNotification] = useState(null);

    // Fetch users when Admin tab is active
    useEffect(() => {
        if (activeTab === 'admin') {
            fetchUsers();
        }
    }, [activeTab]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchUsers = async () => {
        setFetchingUsers(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            } else {
                showNotification('Failed to load users', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error loading users', 'error');
        } finally {
            setFetchingUsers(false);
        }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showNotification('Settings saved successfully!');
        }, 1500);
    };

    const handleDownloadBackup = () => {
        showNotification('Backup download started...', 'info');
    };

    const handleUploadBackup = () => {
        document.getElementById('backup-upload').click();
    };

    const handleCheckUpdates = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showNotification('You are running the latest version (v2.4.1).');
        }, 2000);
    };

    const handleRegenerateKey = () => {
        if(confirm('Are you sure? This will invalidate the old key.')) {
            setApiKey('nm_live_' + Math.random().toString(36).substr(2, 15));
            showNotification('API Key regenerated successfully.');
        }
    };

    const handleAddUser = () => {
        setShowAddUserModal(true);
    };

    const handleSaveNewUser = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    displayName: userData.username,
                    role: userData.role
                })
            });

            if (res.ok) {
                setShowAddUserModal(false);
                showNotification('User added successfully!');
                fetchUsers(); // Refresh list
            } else {
                const err = await res.json();
                showNotification(err.error || 'Failed to add user', 'error');
            }
        } catch (error) {
            showNotification('Error creating user', 'error');
        }
    };

    const handleCreateRole = () => {
        setShowCreateRoleModal(true);
    };
    
    const handleSaveNewRole = (e) => {
        e.preventDefault();
        setShowCreateRoleModal(false);
        showNotification('Role created successfully!');
    };
    
    const handleSavePermissions = () => {
         setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showNotification('Permission schema updated successfully.');
        }, 1000);
    };

    const handleExportLog = () => {
        showNotification('Exporting audit logs to CSV...', 'info');
    };

    return (
        <div className="page-section active" style={{ display: 'block', position: 'relative' }}>
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '15px 25px',
                    background: notification.type === 'success' ? 'rgba(74, 222, 128, 0.9)' : (notification.type === 'info' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(239, 68, 68, 0.9)'),
                    color: 'black',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    fontWeight: '600',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {notification.message}
                </div>
            )}

            <div className="header">
                 <h1 style={{ fontWeight: '800', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icons.settings} System Settings
                </h1>
            </div>

            <div className="content-card" style={{ marginBottom: '20px' }}>
                <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,215,0,0.1)' }}>
                    <TabButton id="general" label="General" icon={Icons.dashboard} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="network" label="Network" icon={Icons.routers} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="backup" label="Backup & Restore" icon={Icons.logs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="firmware" label="Firmware" icon={Icons.devices} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="admin" label="User Management" icon={Icons.users} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="roles" label="Roles" icon={Icons.roles} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="permissions" label="Permissions" icon={Icons.permissions} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="integration" label="Integrations" icon={Icons.integration} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="audit" label="Audit Trails" icon={Icons.audit} activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                <div style={{ marginTop: '20px' }}>
                    
                    {activeTab === 'general' && (
                        <div className="settings-panel">
                            <h3>General Configuration</h3>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>System Name</label>
                                <input type="text" className="form-control" defaultValue="NetManager Pro" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Timezone</label>
                                <select className="form-control" defaultValue="UTC">
                                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                                    <option value="EST">EST (Eastern Standard Time)</option>
                                    <option value="PST">PST (Pacific Standard Time)</option>
                                </select>
                            </div>
                             <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Theme</label>
                                <select className="form-control" defaultValue="dark">
                                    <option value="dark">Dark Mode (Gold)</option>
                                    <option value="light" disabled>Light Mode (Coming Soon)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'network' && (
                        <div className="settings-panel">
                             <h3>Network Configuration</h3>
                             <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Management IP</label>
                                <input type="text" className="form-control" defaultValue="192.168.1.100" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Gateway</label>
                                <input type="text" className="form-control" defaultValue="192.168.1.1" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Primary DNS</label>
                                <input type="text" className="form-control" defaultValue="8.8.8.8" />
                            </div>
                             <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>NTP Server</label>
                                <input type="text" className="form-control" defaultValue="pool.ntp.org" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="settings-panel">
                            <h3>Backup & Restore</h3>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ flex: 1, padding: '20px', background: 'rgba(255,215,0,0.05)', borderRadius: '10px', border: '1px solid rgba(255,215,0,0.2)' }}>
                                    <h4 style={{ marginTop: 0 }}>Create Backup</h4>
                                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Download a full snapshot of the current system configuration.</p>
                                    <button className="btn btn-primary btn-sm" onClick={handleDownloadBackup}>Download Backup</button>
                                </div>
                                <div style={{ flex: 1, padding: '20px', background: 'rgba(255,215,0,0.05)', borderRadius: '10px', border: '1px solid rgba(255,215,0,0.2)' }}>
                                    <h4 style={{ marginTop: 0 }}>Restore Backup</h4>
                                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Upload a verified backup file to restore system state.</p>
                                    <input 
                                        type="file" 
                                        id="backup-upload" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                                showNotification(`Restoring from backup: ${e.target.files[0].name}`, 'info');
                                                setTimeout(() => showNotification('System restored successfully!'), 2000);
                                            }
                                        }}
                                    />
                                    <button className="btn btn-secondary btn-sm" onClick={handleUploadBackup}>Upload File</button>
                                </div>
                            </div>
                            <div className="form-check">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" defaultChecked /> Enable Automatic Daily Backups
                                </label>
                            </div>
                        </div>
                    )}
                    
                     {activeTab === 'firmware' && (
                        <div className="settings-panel">
                            <h3>Firmware Upgrade</h3>
                             <div style={{ padding: '20px', background: 'rgba(255,215,0,0.05)', borderRadius: '10px', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>Current Version</h4>
                                        <span style={{ color: '#FFD700', fontFamily: 'monospace' }}>v2.4.1-stable</span>
                                    </div>
                                    <div>
                                        <button className="btn btn-primary btn-sm" onClick={handleCheckUpdates} disabled={loading}>
                                            {loading ? 'Checking...' : 'Check for Updates'}
                                        </button>
                                    </div>
                                </div>
                                <p style={{ marginTop: '10px', opacity: 0.7, fontSize: '0.9rem' }}>Last checked: Today, 10:00 AM</p>
                            </div>
                             <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '5px' }}>Update Channel</label>
                                <select className="form-control" defaultValue="stable">
                                    <option value="stable">Stable (Recommended)</option>
                                    <option value="beta">Beta</option>
                                    <option value="nightly">Nightly</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="settings-panel">
                            <h3>User Management</h3>
                            {fetchingUsers ? <div style={{padding: '20px', textAlign: 'center'}}>Loading users from Firebase...</div> : (
                                <table className="table" style={{ marginTop: '10px' }}>
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Last Login</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.uid}>
                                                <td>{user.email}</td>
                                                <td>{user.displayName}</td>
                                                <td><span className={`status-badge status-${user.role === 'admin' ? 'active' : 'warning'}`}>{user.role}</span></td>
                                                <td>{user.disabled ? 'Disabled' : 'Active'}</td>
                                                <td>{user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : 'Never'}</td>
                                                <td><button className="btn btn-secondary btn-sm">Edit</button></td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No users found. Note: Server-side listing requires Admin SDK credentials.</td></tr>}
                                    </tbody>
                                </table>
                            )}
                            <button className="btn btn-primary btn-sm" style={{ marginTop: '15px' }} onClick={handleAddUser}>+ Add New User</button>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="settings-panel">
                            <h3>Role Management</h3>
                            <table className="table" style={{ marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th>Role Name</th>
                                        <th>Description</th>
                                        <th>Users Assigned</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span style={{color: '#FFD700', fontWeight: 'bold'}}>Super Admin</span></td>
                                        <td>Full system access with no restrictions</td>
                                        <td>1</td>
                                        <td><button className="btn btn-secondary btn-sm" disabled>System Role</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Network Engineer</strong></td>
                                        <td>Can configure routers, switches, and viewing logs</td>
                                        <td>3</td>
                                        <td><button className="btn btn-secondary btn-sm">Edit</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Read Only</strong></td>
                                        <td>View-only access to dashboards and reports</td>
                                        <td>5</td>
                                        <td><button className="btn btn-secondary btn-sm">Edit</button></td>
                                    </tr>
                                </tbody>
                            </table>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: '15px' }} onClick={handleCreateRole}>+ Create New Role</button>
                        </div>
                    )}

                    {activeTab === 'permissions' && (
                        <div className="settings-panel">
                            <h3>Permission Management</h3>
                            <p style={{opacity: 0.7, marginBottom: '20px'}}>Configure granular access control for system modules.</p>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                <div style={{padding: '15px', background: 'rgba(255,215,0,0.05)', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.1)'}}>
                                    <h4 style={{marginTop: 0, color: '#FFD700'}}>Network Management</h4>
                                    <div className="form-check"><label><input type="checkbox" defaultChecked /> View Devices</label></div>
                                    <div className="form-check"><label><input type="checkbox" defaultChecked /> Configure Routers</label></div>
                                    <div className="form-check"><label><input type="checkbox" defaultChecked /> Configure Switches</label></div>
                                    <div className="form-check"><label><input type="checkbox" /> Factory Reset Devices</label></div>
                                </div>
                                <div style={{padding: '15px', background: 'rgba(255,215,0,0.05)', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.1)'}}>
                                    <h4 style={{marginTop: 0, color: '#FFD700'}}>System Administration</h4>
                                    <div className="form-check"><label><input type="checkbox" defaultChecked /> Manage Users</label></div>
                                    <div className="form-check"><label><input type="checkbox" defaultChecked /> View Audit Logs</label></div>
                                    <div className="form-check"><label><input type="checkbox" /> Manage Billing</label></div>
                                    <div className="form-check"><label><input type="checkbox" /> System Updates</label></div>
                                </div>
                            </div>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: '20px' }} onClick={handleSavePermissions} disabled={loading}>
                                {loading ? 'Saving Schema...' : 'Save Permission Schema'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'integration' && (
                        <div className="settings-panel">
                            <h3>System Integrations</h3>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>API Access</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="text" className="form-control" readOnly value={apiKey} style={{ fontFamily: 'monospace', flex: 1 }} />
                                    <button className="btn btn-secondary btn-sm" onClick={handleRegenerateKey}>Regenerate Key</button>
                                </div>
                                <p style={{ marginTop: '5px', opacity: 0.6, fontSize: '0.8rem' }}>Use this key to authenticate with the NetManager API.</p>
                            </div>
                            
                            <hr style={{ borderColor: 'rgba(255,215,0,0.1)', margin: '20px 0' }} />
                            
                            <h4>Webhooks</h4>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Alert Webhook URL</label>
                                <input type="text" className="form-control" placeholder="https://hooks.slack.com/services/..." />
                            </div>
                            <div className="form-check">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" /> Send Critical Alerts
                                </label>
                            </div>
                             <div className="form-check">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" /> Send System Events
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="settings-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>System Audit Trail</h3>
                                <button className="btn btn-secondary btn-sm" onClick={handleExportLog}>Export Log</button>
                            </div>
                             <table className="table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                        <th>IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>10:42:00 AM</td>
                                        <td>admin</td>
                                        <td>LOGIN_SUCCESS</td>
                                        <td>User logged in successfully</td>
                                        <td>192.168.1.50</td>
                                    </tr>
                                    <tr>
                                        <td>09:30:00 AM</td>
                                        <td>admin</td>
                                        <td>UPDATE_SETTINGS</td>
                                        <td>Changed NTP Server</td>
                                        <td>192.168.1.50</td>
                                    </tr>
                                     <tr>
                                        <td>08:15:00 AM</td>
                                        <td>system</td>
                                        <td>BACKUP_CREATED</td>
                                        <td>Daily system backup completed</td>
                                        <td>localhost</td>
                                    </tr>
                                    <tr>
                                        <td>Yesterday, 05:00 PM</td>
                                        <td>operator</td>
                                        <td>VIEW_ROUTERS</td>
                                        <td>Viewed router list</td>
                                        <td>192.168.1.101</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
            
            {(activeTab !== 'backup' && activeTab !== 'firmware' && activeTab !== 'admin' && activeTab !== 'roles' && activeTab !== 'permissions') && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                     <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
            {/* Add User Modal */}
            <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Add New User">
                <form onSubmit={handleSaveNewUser}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                        <input name="username" type="text" className="form-control" placeholder="e.g. john_doe" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                        <input name="email" type="email" className="form-control" placeholder="john@company.com" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
                        <select name="role" className="form-control">
                            <option value="read_only">Read Only</option>
                            <option value="network_engineer">Network Engineer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                        <input name="password" type="password" className="form-control" placeholder="Temp password" required />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create User</button>
                    </div>
                </form>
            </Modal>
            
            {/* Create Role Modal */}
            <Modal isOpen={showCreateRoleModal} onClose={() => setShowCreateRoleModal(false)} title="Create New Role">
                <form onSubmit={handleSaveNewRole}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Role Name</label>
                        <input type="text" className="form-control" placeholder="e.g. Security Auditor" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                        <textarea className="form-control" placeholder="Describe the role's purpose..." rows="3" required></textarea>
                    </div>
                     <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px' }}>Base Permissions</label>
                        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                            <div className="form-check"><label><input type="checkbox" /> View Dashboard</label></div>
                            <div className="form-check"><label><input type="checkbox" /> View Devices</label></div>
                            <div className="form-check"><label><input type="checkbox" /> Manage Users</label></div>
                             <div className="form-check"><label><input type="checkbox" /> Edit Settings</label></div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCreateRoleModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Role</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
