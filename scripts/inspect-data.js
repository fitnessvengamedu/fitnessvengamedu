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
  console.log("=== DB DATA INSPECTOR ===");
  const { data: users, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Auth error:", authError);
  } else {
    console.log(`Found ${users.length} users in Auth`);
    if (users.length > 0) {
      console.log("Sample user metadata:", JSON.stringify(users[0].user_metadata, null, 2));
    }
  }

  const { data: profiles, error: profError } = await supabase.from('profiles').select('*').limit(2);
  if (profError) {
    console.error("Profiles error:", profError);
  } else {
    console.log(`Found ${profiles.length} profiles`);
    console.log("Sample profiles:", JSON.stringify(profiles, null, 2));
  }

  const { data: subs, error: subError } = await supabase.from('subscriptions').select('*').limit(2);
  if (subError) {
    console.error("Subscriptions error:", subError);
  } else {
    console.log(`Found ${subs.length} subscriptions`);
    console.log("Sample subscriptions:", JSON.stringify(subs, null, 2));
  }
}

main();
