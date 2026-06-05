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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showItems() {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Database items:", JSON.stringify(data, null, 2));
  }
}

showItems();
