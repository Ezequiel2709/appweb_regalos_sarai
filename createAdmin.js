import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  console.log('Intentando registrar admin@gmail.com...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@gmail.com',
    password: 'admin123',
  });

  if (error) {
    console.error('Error al crear:', error.message);
  } else {
    console.log('¡Usuario administrador creado exitosamente en Supabase!');
    console.log(data);
  }
}

createAdmin();
