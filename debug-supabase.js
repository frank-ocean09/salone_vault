
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkSupabase() {
    console.log('Reading .env.local...');
    let supabaseUrl = '';
    let supabaseAnonKey = '';

    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
                    if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value;
                }
            });
        } else {
            console.error('.env.local not found');
            return;
        }
    } catch (e) {
        console.error('Error reading .env.local:', e);
        return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase credentials in .env.local');
        return;
    }

    console.log('Supabase URL:', supabaseUrl);
    console.log('Checking Supabase connection...');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check Storage Buckets
    try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
            console.error('Error listing buckets:', bucketError);
        } else {
            console.log('Buckets:', buckets?.map(b => b.name));
            const docBucket = buckets?.find(b => b.name === 'Documents');
            if (!docBucket) {
                console.error('CRITICAL: "Documents" bucket not found!');
            } else {
                console.log('Found "Documents" bucket.');
            }
        }
    } catch (e) {
        console.error('Exception checking buckets:', e);
    }

    // Check Documents Table
    try {
        const { data: docs, error: dbError } = await supabase
            .from('documents')
            .select('count', { count: 'exact', head: true });

        if (dbError) {
            console.error('Error accessing "documents" table:', dbError);
        } else {
            console.log('"documents" table is accessible.');
        }
    } catch (e) {
        console.error('Exception checking database:', e);
    }
}

checkSupabase();
