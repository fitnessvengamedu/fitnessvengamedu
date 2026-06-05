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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase configuration in .env");
  process.exit(1);
}

async function main() {
  const myFetch = typeof fetch === 'function' ? fetch : require('node-fetch');

  try {
    const response = await myFetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    const schema = await response.json();
    
    console.log("Exposed Tables:");
    for (const tableName in schema.definitions) {
      console.log(`\nTable: ${tableName}`);
      const properties = schema.definitions[tableName].properties;
      for (const colName in properties) {
        console.log(`  - ${colName}: ${properties[colName].type} (${properties[colName].format || ''})`);
      }
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

main();
