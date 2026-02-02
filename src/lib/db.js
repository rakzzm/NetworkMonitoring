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

    // --- Users ---
    const users = [
        { id: uuidv4(), username: 'admin', password: bcrypt.hashSync('admin123', 10), email: 'admin@meghcomm.store', role: 'admin' },
        { id: uuidv4(), username: 'operator', password: bcrypt.hashSync('op123', 10), email: 'operator@netmanager.local', role: 'read_only' }
    ];
    // Add 8 more dummy users
    for(let i=1; i<=8; i++) {
        users.push({ id: uuidv4(), username: `staff${i}`, password: bcrypt.hashSync('pass', 10), email: `staff${i}@netmanager.local`, role: 'user' });
    }
    users.forEach(u => {
        db.run('INSERT INTO users (id, username, password, email, role) VALUES (?, ?, ?, ?, ?)', [u.id, u.username, u.password, u.email, u.role]);
    });

    // --- Helper to gen random IP ---
    const randIp = (subnet) => `192.168.${subnet}.${Math.floor(Math.random() * 250) + 2}`;
    const randMac = () => 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16)));
    const statuses = ['online', 'offline', 'maintenance'];

    // --- Routers (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO routers (id, name, ip_address, mac_address, firmware_version, status, location, uptime, cpu_usage, memory_usage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [uuidv4(), `Router-${i}`, randIp(1), randMac(), 'v2.4.1', statuses[i%3 === 0 ? 1 : 0], `Room ${100+i}`, `${i}d 2h`, Math.random()*100, Math.random()*100]);
    }

    // --- Switches (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO switches (id, name, ip_address, status, location, port_count, poe_ports, vlan_support) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), `Switch-L2-${i}`, randIp(2), statuses[i%4===0?1:0], `Closet ${i}`, 48, 24, 'yes']);
    }

    // --- Access Points (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO access_points (id, name, ip_address, status, location, connected_clients, signal_strength, ssid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), `AP-Zone-${i}`, randIp(3), statuses[i%5===0?1:0], `Ceiling ${i}`, Math.floor(Math.random()*50), -40 - Math.floor(Math.random()*40), i%2===0 ? 'Staff-WiFi' : 'Guest-WiFi']);
    }

    // --- SSIDs (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO ssids (id, name, encryption, status, bandwidth_limit) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), `SSID-${i}`, i%3===0?'WPA2':'WPA3', 'active', (i*10)+5]);
    }

    // --- VLANs (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO vlans (id, vlan_id, name, subnet, gateway, description) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), 10+i, `VLAN-${10+i}`, `10.0.${10+i}.0/24`, `10.0.${10+i}.1`, `Segment for department ${i}`]);
    }

    // --- Bandwidth Rules (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO bandwidth_rules (id, name, download_speed, upload_speed, priority, description) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), `Rule-${i}`, 100*i, 10*i, i%5, `QoS Policy ${i}`]);
    }

    // --- SIP Rules (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO sip_rules (id, name, source_ip, destination_ip, port, action, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), `SIP-Policy-${i}`, randIp(10), randIp(20), 5060+i, i%2===0?'allow':'deny', `VoIP Control ${i}`]);
    }

    // --- Captive Portal (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO captive_portal (id, name, welcome_message, redirect_url, status) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), `Portal-${i}`, `Welcome to usage policy ${i}`, `https://example.com/start${i}`, 'active']);
    }

    // --- Traffic Logs (20) ---
    for(let i=1; i<=20; i++) {
        db.run('INSERT INTO traffic_logs (id, source_ip, destination_ip, port, protocol, bytes_in, bytes_out) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), randIp(5), randIp(6), 80+i, i%2===0?'TCP':'UDP', Math.random()*10000, Math.random()*10000]);
    }
    
    // --- Troubleshooting Results (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO troubleshooting_results (id, tool_name, target, result, status) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), i%2===0?'Ping':'Traceroute', randIp(8), 'Success: 14ms', 'completed']);
    }

    // --- Notifications (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO notifications (id, type, device_name, message, severity, status) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), 'alert', `Device-${i}`, `High CPU usage detected on node ${i}`, i%3===0?'critical':'warning', 'active']);
    }

    // --- Network Devices (10) ---
    for(let i=1; i<=10; i++) {
        db.run('INSERT INTO network_devices (id, name, type, ip_address, mac_address, status, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), `Printer-${i}`, 'printer', randIp(9), randMac(), 'online', `Hallway ${i}`]);
    }

    // --- Hotspot Users (keep large set for stats) ---
    for(let i=0; i<150; i++) {
        db.run('INSERT INTO hotspot_users (id, username, password, status) VALUES (?, ?, ?, ?)', 
            [uuidv4(), `user${i}`, 'pass', Math.random() > 0.1 ? 'active' : 'expired']);
    }
}
