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

const ddl = `
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to gallery items" ON public.gallery_items;
CREATE POLICY "Allow public read access to gallery items" 
ON public.gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write access to gallery items" ON public.gallery_items;
CREATE POLICY "Allow admin write access to gallery items" 
ON public.gallery_items FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
`;

async function main() {
  console.log("Attempting to run DDL via common Supabase RPCs...");
  
  // Try 'exec_sql'
  const { data: d1, error: e1 } = await supabase.rpc('exec_sql', { sql: ddl });
  if (e1) {
    console.log("exec_sql failed:", e1.message);
  } else {
    console.log("exec_sql succeeded:", d1);
    return;
  }

  // Try 'run_sql'
  const { data: d2, error: e2 } = await supabase.rpc('run_sql', { sql: ddl });
  if (e2) {
    console.log("run_sql failed:", e2.message);
  } else {
    console.log("run_sql succeeded:", d2);
    return;
  }

  // Try 'execute_sql'
  const { data: d3, error: e3 } = await supabase.rpc('execute_sql', { query: ddl });
  if (e3) {
    console.log("execute_sql failed:", e3.message);
  } else {
    console.log("execute_sql succeeded:", d3);
    return;
  }

  console.log("No common SQL execution RPC succeeded.");
}

main();
