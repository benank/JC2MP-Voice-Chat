import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

class DB {
    constructor() {
        this.initialized = false;
        this.openDB();
    }

    async openDB() {
        this.db = await open({
            filename: '../../../server.db',
            driver: sqlite3.cached.Database,
            mode: sqlite3.OPEN_READONLY
        });
        
        this.initialized = true;
    }

    async getSteamIdFromVoiceCode(voice_code) {
        try {
            const result = await this.db.get(
                'SELECT steamID FROM voice WHERE voice_code = ?',
                voice_code
            );
            return result?.steamID;
        } catch {
            return null;
        }
        
    }
}

const db = new DB();
export default db;