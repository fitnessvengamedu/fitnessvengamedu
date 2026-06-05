const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
try {
  const envPath = path.resolve(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
} catch (err) {
  console.error("Error reading .env:", err.message);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Try querying pg_proc via PostgREST
  const { data: d1, error: e1 } = await supabase.from('pg_proc').select('*').limit(5);
  console.log("pg_proc:", e1 ? e1.message : d1);

  // Try querying information_schema.tables
  const { data: d2, error: e2 } = await supabase.from('tables').select('*').limit(5);
  console.log("tables:", e2 ? e2.message : d2);
}

main();
