const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.strip ? line.strip() : line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
} catch (err) {
  console.error(err);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await client
    .from('profiles')
    .select('role, full_name')
    .eq('id', 'f65a3cb7-aa99-4d26-a0fa-b6970adfc2df')
    .single();

  console.log("Profile data retrieved:", data);
  console.log("Error:", error);
}

main();
