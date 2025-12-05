
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
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

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Sign Up/In
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Signing up test user: ${email}`);

    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth error:', authError);
        return;
    }

    if (!user) {
        console.error('No user returned after signup');
        return;
    }
    console.log('User created/logged in:', user.id);

    // 2. Upload
    const fileName = `test_${Date.now()}.txt`;
    const filePath = `${user.id}/${fileName}`;
    const fileContent = Buffer.from('Hello World');

    console.log(`Attempting upload to Documents/${filePath}...`);

    const { data, error } = await supabase.storage
        .from('Documents')
        .upload(filePath, fileContent, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error('Upload failed:', error);
    } else {
        console.log('Upload successful:', data);
    }
}

testUpload();
