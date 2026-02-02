import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

let dbInstance = null;
const DB_PATH = path.join(process.cwd(), 'netmanager.db');

export async function getDb() {
    if (dbInstance) return dbInstance;

    const wasmPath = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
    const wasmBinary = fs.readFileSync(wasmPath);
    const SQL = await initSqlJs({ wasmBinary });
    
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        dbInstance = new SQL.Database(fileBuffer);
    } else {
        dbInstance = new SQL.Database();
        // Initialize schema if new DB
        initSchema(dbInstance);
        seedData(dbInstance);
        saveDb();
    }

    return dbInstance;
}

export function saveDb() {
    if (!dbInstance) return;
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

function run(sql, params = []) {
    if (!dbInstance) throw new Error("DB not initialized");
    dbInstance.run(sql, params);
    saveDb();
}

// Helper to init schema (copied from server.js)
function initSchema(db) {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS routers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            mac_address TEXT,
            firmware_version TEXT,
            status TEXT DEFAULT 'online',
            location TEXT,
            uptime TEXT,
            cpu_usage REAL,
            memory_usage REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    // ... Add other tables here based on server.js ...
    // For brevity in this file, I'm including the key ones mentioned. 
    // real implementation should include ALL tables from server.js
    
    db.run(`CREATE TABLE IF NOT EXISTS switches (id TEXT PRIMARY KEY, name TEXT NOT NULL, ip_address TEXT NOT NULL, mac_address TEXT, port_count INTEGER DEFAULT 24, firmware_version TEXT, status TEXT DEFAULT 'online', location TEXT, vlan_support TEXT, poe_ports INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS access_points (id TEXT PRIMARY KEY, name TEXT NOT NULL, ip_address TEXT NOT NULL, mac_address TEXT, ssid TEXT, status TEXT DEFAULT 'online', location TEXT, signal_strength INTEGER, connected_clients INTEGER, channel INTEGER, frequency TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS vlans (id TEXT PRIMARY KEY, vlan_id INTEGER UNIQUE NOT NULL, name TEXT NOT NULL, subnet TEXT, gateway TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS ssids (id TEXT PRIMARY KEY, name TEXT NOT NULL, password TEXT, encryption TEXT DEFAULT 'WPA2', hidden INTEGER DEFAULT 0, bandwidth_limit INTEGER, vlan_id TEXT, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS bandwidth_rules (id TEXT PRIMARY KEY, name TEXT NOT NULL, download_speed INTEGER, upload_speed INTEGER, priority INTEGER DEFAULT 5, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS hotspot_users (id TEXT PRIMARY KEY, username TEXT NOT NULL, password TEXT NOT NULL, profile TEXT DEFAULT 'default', data_limit INTEGER, time_limit INTEGER, download_limit INTEGER, upload_limit INTEGER, expire_date DATETIME, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS captive_portal (id TEXT PRIMARY KEY, name TEXT NOT NULL, welcome_message TEXT, redirect_url TEXT, authentication_type TEXT DEFAULT 'radius', radius_server TEXT, radius_secret TEXT, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS sip_rules (id TEXT PRIMARY KEY, name TEXT NOT NULL, source_ip TEXT, destination_ip TEXT, port INTEGER, action TEXT DEFAULT 'allow', priority INTEGER DEFAULT 5, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS traffic_logs (id TEXT PRIMARY KEY, source_ip TEXT, destination_ip TEXT, port INTEGER, protocol TEXT, bytes_in INTEGER, bytes_out INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS troubleshooting_results (id TEXT PRIMARY KEY, tool_name TEXT NOT NULL, target TEXT, result TEXT, status TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, type TEXT NOT NULL, device_id TEXT, device_name TEXT, message TEXT NOT NULL, severity TEXT DEFAULT 'info', is_read INTEGER DEFAULT 0, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS network_devices (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, ip_address TEXT, mac_address TEXT, status TEXT DEFAULT 'online', location TEXT, last_seen DATETIME DEFAULT CURRENT_TIMESTAMP)`);
}

function seedData(db) {
    const result = db.exec('SELECT COUNT(*) as count FROM users');
    if (result.length > 0 && result[0].values[0][0] > 0) return;

    // Seed Users
    const users = [
        { id: uuidv4(), username: 'admin', password: bcrypt.hashSync('admin123', 10), email: 'admin@meghcomm.store', role: 'admin' },
        { id: uuidv4(), username: 'operator', password: bcrypt.hashSync('op123', 10), email: 'operator@netmanager.local', role: 'read_only' }
    ];
    users.forEach(u => {
        db.run('INSERT INTO users (id, username, password, email, role) VALUES (?, ?, ?, ?, ?)', [u.id, u.username, u.password, u.email, u.role]);
    });

    // Seed Routers
    const routers = [
        { id: uuidv4(), name: 'Core-Router-01', ip_address: '192.168.1.1', mac_address: '00:11:22:33:44:55', firmware_version: 'v2.4.1', status: 'online', location: 'Server Room', uptime: '15d 4h 2m', cpu_usage: 45.2, memory_usage: 60.1 },
        { id: uuidv4(), name: 'Edge-Router-02', ip_address: '192.168.1.2', mac_address: '00:11:22:33:44:56', firmware_version: 'v2.4.0', status: 'online', location: 'Floor 1', uptime: '10d 2h 1m', cpu_usage: 12.5, memory_usage: 30.5 },
        { id: uuidv4(), name: 'Backup-Router-03', ip_address: '192.168.1.3', mac_address: '00:11:22:33:44:57', firmware_version: 'v2.3.9', status: 'offline', location: 'Basement', uptime: '0d 0h 0m', cpu_usage: 0, memory_usage: 0 }
    ];
    routers.forEach(r => {
        db.run('INSERT INTO routers (id, name, ip_address, mac_address, firmware_version, status, location, uptime, cpu_usage, memory_usage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [r.id, r.name, r.ip_address, r.mac_address, r.firmware_version, r.status, r.location, r.uptime, r.cpu_usage, r.memory_usage]);
    });

    // Seed Switches
    const switches = [
        { id: uuidv4(), name: 'Core-Switch-01', ip_address: '192.168.2.1', status: 'online', location: 'Server Room', port_count: 48, poe_ports: 24, vlan_support: 'yes' },
        { id: uuidv4(), name: 'Dist-Switch-02', ip_address: '192.168.2.2', status: 'online', location: 'Floor 1', port_count: 24, poe_ports: 12, vlan_support: 'yes' },
        { id: uuidv4(), name: 'Access-Switch-03', ip_address: '192.168.2.3', status: 'maintenance', location: 'Floor 2', port_count: 24, poe_ports: 0, vlan_support: 'no' }
    ];
    switches.forEach(s => {
        db.run('INSERT INTO switches (id, name, ip_address, status, location, port_count, poe_ports, vlan_support) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [s.id, s.name, s.ip_address, s.status, s.location, s.port_count, s.poe_ports, s.vlan_support]);
    });

    // Seed Access Points
    const aps = [
        { id: uuidv4(), name: 'AP-Lobby', ip_address: '192.168.3.10', status: 'online', location: 'Lobby', connected_clients: 24, signal_strength: -45, ssid: 'Guest-WiFi' },
        { id: uuidv4(), name: 'AP-ConfRoom', ip_address: '192.168.3.11', status: 'online', location: 'Conference Room', connected_clients: 12, signal_strength: -55, ssid: 'Staff-WiFi' },
        { id: uuidv4(), name: 'AP-Office-West', ip_address: '192.168.3.12', status: 'online', location: 'West Wing', connected_clients: 35, signal_strength: -60, ssid: 'Staff-WiFi' },
        { id: uuidv4(), name: 'AP-Office-East', ip_address: '192.168.3.13', status: 'offline', location: 'East Wing', connected_clients: 0, signal_strength: 0, ssid: 'Staff-WiFi' }
    ];
    aps.forEach(ap => {
        db.run('INSERT INTO access_points (id, name, ip_address, status, location, connected_clients, signal_strength, ssid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [ap.id, ap.name, ap.ip_address, ap.status, ap.location, ap.connected_clients, ap.signal_strength, ap.ssid]);
    });

    // Seed SSIDs
    const ssids = [
        { id: uuidv4(), name: 'Staff-WiFi', encryption: 'WPA3', status: 'active', bandwidth_limit: 100 },
        { id: uuidv4(), name: 'Guest-WiFi', encryption: 'WPA2', status: 'active', bandwidth_limit: 10 },
        { id: uuidv4(), name: 'IoT-Network', encryption: 'WPA2', status: 'hidden', bandwidth_limit: 5 }
    ];
    ssids.forEach(ssid => {
        db.run('INSERT INTO ssids (id, name, encryption, status, bandwidth_limit) VALUES (?, ?, ?, ?, ?)',
            [ssid.id, ssid.name, ssid.encryption, ssid.status, ssid.bandwidth_limit]);
    });
    
    // Seed Hotspot Users (for stats)
    for(let i=0; i<150; i++) {
        db.run('INSERT INTO hotspot_users (id, username, password, status) VALUES (?, ?, ?, ?)', 
            [uuidv4(), `user${i}`, 'pass', Math.random() > 0.1 ? 'active' : 'expired']);
    }
}
