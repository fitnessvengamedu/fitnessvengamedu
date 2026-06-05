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

const testEmail = "testmember123@example.com";
const testPassword = "TestMemberSecret2026!";

async function main() {
  console.log("=== S FITNESS PAYMENT & REMINDER TEST SUITE ===");
  
  try {
    // 1. Fetch or create test member
    console.log(`Checking for test member: ${testEmail}...`);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let testUser = users.find(u => u.email === testEmail);
    let userId = "";

    const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID || "8250992325";

    if (testUser) {
      console.log(`Test member found: ${testUser.id}`);
      userId = testUser.id;
      
      // Clear last_payment_reminder_sent_for to ensure the test alert triggers
      console.log("Resetting user metadata for clean test...");
      const currentMeta = testUser.user_metadata || {};
      const updatedMeta = {
        ...currentMeta,
        telegram_chat_id: ownerChatId, // Send user alert to owner chat for testing
        telegram_linked: true,
        last_payment_reminder_sent_for: null
      };

      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: updatedMeta
      });
      if (updateAuthError) throw updateAuthError;

    } else {
      console.log("Creating new test member...");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: "Test Athlete",
          telegram_chat_id: ownerChatId,
          telegram_linked: true,
          fitness_goal: "Endurance & Speed",
          target_weight: "75",
          target_calories: "2800"
        }
      });
      if (createError) throw createError;
      userId = newUser.user.id;
      console.log(`Test member created: ${userId}`);
    }
    // Profiles table does not need direct mutation since metadata handles it
    console.log("Skipping profiles table checks, metadata holds telegram connection...");

    // 2. Query/Upsert subscription record set to expire in 6.5 days (within the 7-day reminder window)
    console.log("Creating/updating active subscription record expiring in 6.5 days...");
    const planId = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY || "plan_Swj162e2tGBqGT";
    const currentPeriodStart = new Date().toISOString();
    const currentPeriodEnd = new Date(Date.now() + 6.5 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSub) {
      console.log(`Updating existing subscription ${existingSub.id}...`);
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan_id: planId,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      if (subError) throw subError;
    } else {
      console.log("Inserting new test subscription...");
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: 'active',
          plan_id: planId,
          razorpay_subscription_id: 'sub_test123',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      if (subError) throw subError;
    }

    console.log(`✅ Database setup complete!`);
    console.log(`Test User ID: ${userId}`);
    console.log(`Subscription Due Date: ${currentPeriodEnd} (6.5 days from now)`);
    console.log("\nAttempting to trigger the cron route locally via fetch...");

    // 3. Trigger local server cron endpoint if running
    const cronSecret = process.env.CRON_SECRET || 'fitness_cron_secret_key_123';
    const cronUrl = `http://localhost:3000/api/telegram/cron?secret=${cronSecret}`;

    try {
      const response = await fetch(cronUrl, { method: 'POST' });
      const result = await response.json();
      console.log("\n--- CRON RESPONSE ---");
      console.log(JSON.stringify(result, null, 2));
      console.log("---------------------\n");
      if (result.remindersSent > 0) {
        console.log("🎉 SUCCESS: Renewal reminder alert was successfully processed!");
      } else {
        console.log("⚠️ WARNING: Cron executed, but no reminders were sent. Check log messages above.");
      }
    } catch (fetchErr) {
      console.log(`\n❌ Local server not running or unreachable at ${cronUrl}.`);
      console.log("Please make sure your Next.js server is running (npm run dev) and run this test again.");
    }

  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

main();
