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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase configuration in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

// Take CLI arguments or use defaults
const email = process.argv[2] || "admin@sfitness.com";
const password = process.argv[3] || "ApexAdminSecret2026!";
const fullName = process.argv[4] || "System Admin";

async function main() {
  console.log(`Checking for admin user: ${email}...`);

  try {
    // 1. Get user by email from auth admin API
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError.message);
      process.exit(1);
    }

    let existingUser = users.find(u => u.email === email);
    let userId = "";

    if (existingUser) {
      console.log(`User already exists in Supabase Auth (ID: ${existingUser.id}).`);
      userId = existingUser.id;
    } else {
      console.log(`Creating user in Supabase Auth...`);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });

      if (createError) {
        console.error("Error creating user:", createError.message);
        process.exit(1);
      }

      console.log(`User created successfully (ID: ${newUser.user.id}).`);
      userId = newUser.user.id;
    }

    // 2. Insert or update the role in profiles table
    console.log(`Checking profile for user ID: ${userId}...`);
    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileFetchError && profileFetchError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileFetchError.message);
      process.exit(1);
    }

    if (profile) {
      console.log(`Profile found. Elevating role to 'admin'...`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: fullName })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating profile:", updateError.message);
        process.exit(1);
      }
      console.log(`Profile updated successfully! ${email} is now an ADMIN.`);
    } else {
      console.log(`No profile found. Creating a new profile with 'admin' role...`);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'admin',
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error inserting profile:", insertError.message);
        process.exit(1);
      }
      console.log(`Profile inserted successfully! ${email} is now an ADMIN.`);
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

main();
