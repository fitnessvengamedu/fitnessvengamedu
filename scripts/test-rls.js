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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  console.log("Supabase URL:", supabaseUrl);
  
  // 1. Check with service key (bypasses RLS)
  const clientService = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profilesService, error: errorService } = await clientService
    .from('profiles')
    .select('id, role, full_name')
    .limit(5);
  
  console.log("\n--- SERVICE ROLE KEY QUERY (PROFILES) ---");
  console.log("Profiles fetched:", profilesService);
  console.log("Error:", errorService);

  // 2. Check subscriptions table
  const { data: subsService, error: errorSubs } = await clientService
    .from('subscriptions')
    .select('*')
    .limit(5);
  
  console.log("\n--- SERVICE ROLE KEY QUERY (SUBSCRIPTIONS) ---");
  console.log("Subscriptions fetched:", subsService);
  console.log("Error:", errorSubs);

  // 3. Check with anon key (subject to RLS, unauthenticated)
  const clientAnon = createClient(supabaseUrl, supabaseAnonKey);
  const { data: profilesAnon, error: errorAnon } = await clientAnon
    .from('profiles')
    .select('id, role, full_name')
    .limit(5);

  console.log("\n--- ANON KEY QUERY (UNAUTHENTICATED) ---");
  console.log("Profiles fetched:", profilesAnon);
  console.log("Error:", errorAnon);
}

main();
