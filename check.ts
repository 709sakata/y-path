import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
fs.writeFileSync('key-status.txt', key ? 'SET' : 'NOT SET');
