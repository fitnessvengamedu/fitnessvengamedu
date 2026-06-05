import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Bot } from 'grammy';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const memberBot = new Bot(process.env.TELEGRAM_MEMBER_BOT_TOKEN || "0000000000:dummy_member_token");
const trainerBot = new Bot(process.env.TELEGRAM_TRAINER_BOT_TOKEN || "0000000000:dummy_trainer_token");

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

function getPlanName(planId: string): string {
  if (planId === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY) return 'Monthly Plan';
  if (planId === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_QUARTERLY) return 'Quarterly Plan';
  if (planId === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_HALFYEARLY) return 'Half-Yearly Plan';
  if (planId === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY) return 'Yearly Plan';
  return 'Premium Gym Plan';
}

async function handleCron(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get('secret');
    const authHeader = request.headers.get('authorization');
    
    const cronSecret = process.env.CRON_SECRET || 'fitness_cron_secret_key_123';
    
    // Validate authorization
    if (secretParam !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting S Fitness automated execution...');
    const now = Date.now();

    // 1. Fetch active subscriptions with due dates
    const { data: activeSubscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, status, current_period_end, plan_id')
      .eq('status', 'active');

    if (subError) {
      console.error('[Cron] Error fetching active subscriptions:', subError);
      return NextResponse.json({ error: 'Failed to fetch active subscriptions' }, { status: 500 });
    }

    const activeUserIds = new Set(activeSubscriptions.map(sub => sub.user_id));

    // 2. Fetch all registered users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError || !users) {
      console.error('[Cron] Error fetching users from auth admin:', usersError);
      return NextResponse.json({ error: 'Failed to fetch user accounts' }, { status: 500 });
    }

    const sentCheckins = [];
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

    // 3. Filter and alert members due for their check-in
    console.log('[Cron] Executing bi-weekly check-ins...');
    for (const user of users) {
      const metadata = user.user_metadata || {};
      const telegramChatId = metadata.telegram_chat_id;

      if (!telegramChatId) continue; // No Telegram linked

      // Check membership state
      const isSubscriptionActive = activeUserIds.has(user.id);
      const isTestUser = metadata.email === 'testmember123@example.com' || metadata.is_test === true;
      const isActiveMember = isSubscriptionActive || isTestUser;

      if (!isActiveMember) {
        console.log(`[Cron] User ${user.email} has Telegram linked but no active gym membership. Skipping.`);
        continue;
      }

      // Check last alert timing
      const lastAlertAt = metadata.last_telegram_alert_at;
      const isDue = !lastAlertAt || (now - new Date(lastAlertAt).getTime() >= twoWeeksMs);

      if (!isDue) {
        console.log(`[Cron] User ${user.email} is active but alert is not due yet. Skipping.`);
        continue;
      }

      // Send the bi-weekly update
      const fullName = metadata.full_name || 'Athlete';
      const targetWeight = metadata.target_weight || 'Not set';
      const targetCalories = metadata.target_calories || 'Not set';
      const fitnessGoal = metadata.fitness_goal || 'Keep moving!';

      const alertMessage = 
        `⚡ *S FITNESS — ELITE PERFORMANCE CHECK-IN* 🏋️\n\n` +
        `Hello *${fullName}*, this is your scheduled bi-weekly progress alert. Stay disciplined and keep pushing your boundaries!\n\n` +
        `💪 *Current Goal:* ${fitnessGoal}\n` +
        `🎯 *Target Weight:* ${targetWeight} kg\n` +
        `🔥 *Daily Target Calories:* ${targetCalories} kcal\n\n` +
        `Make sure to log your workouts and nutrition in the member dashboard today to track your progress!\n\n` +
        `_Engineered for Performance_ 🚀`;

      try {
        await memberBot.api.sendMessage(telegramChatId, alertMessage, { parse_mode: 'Markdown' });
        
        // Update user metadata with new alert timestamp
        const updatedMetadata = {
          ...metadata,
          last_telegram_alert_at: new Date().toISOString()
        };

        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: updatedMetadata
        });

        // Gracefully update profiles table
        try {
          await supabaseAdmin
            .from('profiles')
            .update({
              last_telegram_alert_at: new Date().toISOString()
            })
            .eq('id', user.id);
        } catch (dbErr) {
          console.log('[Cron] Could not update last_telegram_alert_at in profiles table directly, falling back:', dbErr);
        }

        sentCheckins.push(user.email || user.id);
        console.log(`[Cron] Sent bi-weekly alert to ${user.email}`);

      } catch (tgErr) {
        console.error(`[Cron] Failed to send Telegram message to ${user.email} (Chat ID: ${telegramChatId}):`, tgErr);
      }
    }

    // 4. Send 7-day payment renewal reminders to members and trainer/owner
    console.log('[Cron] Checking for membership renewal reminders...');
    const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
    const sentReminders = [];

    for (const sub of activeSubscriptions) {
      if (!sub.current_period_end) continue;

      const user = users.find(u => u.id === sub.user_id);
      if (!user) continue;

      const metadata = user.user_metadata || {};
      const telegramChatId = metadata.telegram_chat_id;
      const email = user.email || 'No email';
      const fullName = metadata.full_name || 'Athlete';

      const msRemaining = new Date(sub.current_period_end).getTime() - now;
      const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);

      // Trigger reminder if due within 7 days and has not been sent yet for this period end
      if (daysRemaining <= 7 && daysRemaining > 0) {
        const lastReminderFor = metadata.last_payment_reminder_sent_for;
        const alreadySent = lastReminderFor === sub.current_period_end;

        if (alreadySent) {
          console.log(`[Cron] Renewal reminder already sent to ${email} for period ending ${sub.current_period_end}. Skipping.`);
          continue;
        }

        const planName = getPlanName(sub.plan_id);
        const formattedDueDate = new Date(sub.current_period_end).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const daysRound = Math.ceil(daysRemaining);

        // A. Send message to specific user (if Telegram linked)
        if (telegramChatId) {
          const userAlertMessage = 
            `🚨 *S FITNESS — RENEWAL REMINDER* 🚨\n\n` +
            `Hello *${fullName}*,\n\n` +
            `Your *${planName}* is due for renewal on *${formattedDueDate}* (in ${daysRound} days).\n\n` +
            `Please renew your membership in the member dashboard to ensure uninterrupted gym access.\n\n` +
            `Stay disciplined! 💪`;

          try {
            await memberBot.api.sendMessage(telegramChatId, userAlertMessage, { parse_mode: 'Markdown' });
            console.log(`[Cron] Sent renewal reminder to member ${email}`);
          } catch (tgErr) {
            console.error(`[Cron] Failed to send renewal reminder to member ${email}:`, tgErr);
          }
        }

        // B. Send notification to the trainer/owner (always)
        if (ownerChatId) {
          const trainerAlertMessage =
            `⚠️ *MEMBERSHIP RENEWAL ALERT* ⚠️\n\n` +
            `Member: *${fullName}*\n` +
            `Email: ${email}\n` +
            `Plan: *${planName}*\n` +
            `Due Date: *${formattedDueDate}* (in ${daysRound} days)\n` +
            `Device Status: ${telegramChatId ? '✅ Linked' : '❌ Unlinked'}`;

          try {
            await trainerBot.api.sendMessage(ownerChatId, trainerAlertMessage, { parse_mode: 'Markdown' });
            console.log(`[Cron] Sent renewal notification to trainer for member ${email}`);
          } catch (tgErr) {
            console.error(`[Cron] Failed to send renewal notification to trainer:`, tgErr);
          }
        }

        // C. Update user metadata to avoid duplicate sends
        const updatedMetadata = {
          ...metadata,
          last_payment_reminder_sent_for: sub.current_period_end
        };

        try {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: updatedMetadata
          });

          sentReminders.push(email);
        } catch (updateErr) {
          console.error(`[Cron] Failed to update reminder metadata for ${email}:`, updateErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkinsSent: sentCheckins.length,
      checkinsRecipients: sentCheckins,
      remindersSent: sentReminders.length,
      remindersRecipients: sentReminders
    });

  } catch (error: any) {
    console.error('[Cron] Critical alert execution error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
