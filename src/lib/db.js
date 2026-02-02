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

    const users = [
        { id: uuidv4(), username: 'admin', password: bcrypt.hashSync('admin123', 10), email: 'admin@netmanager.local', role: 'admin' },
        // ... other users
    ];
    users.forEach(u => {
        db.run('INSERT INTO users (id, username, password, email, role) VALUES (?, ?, ?, ?, ?)', [u.id, u.username, u.password, u.email, u.role]);
    });
    
    // ... seed other data ...
}
