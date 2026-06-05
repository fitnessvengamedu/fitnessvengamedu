import { Bot, webhookCallback } from "grammy";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create a new bot instance using the token from .env (with fallback for build time)
const bot = new Bot(process.env.TELEGRAM_MEMBER_BOT_TOKEN || "0000000000:dummy_member_token");

// Start command setup with deep-linking
bot.command("start", async (ctx) => {
  const startPayload = ctx.match; // Extracts parameter after /start (user.id)

  if (startPayload) {
    await ctx.reply("Verifying your gym account... ⏳");
    try {
      // Look up the user using the admin API
      const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(startPayload);

      if (error || !user) {
        await ctx.reply("❌ Invalid verification link or account not found. Please click 'Link Device' directly from your dashboard.");
        return;
      }

      // Update user metadata in Auth.users
      const metadata = user.user_metadata || {};
      const updatedMetadata = {
        ...metadata,
        telegram_chat_id: String(ctx.chat.id),
        telegram_linked: true
      };

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(startPayload, {
        user_metadata: updatedMetadata
      });

      if (updateError) {
        throw updateError;
      }

      // Gracefully update the profiles table too if possible
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            telegram_chat_id: String(ctx.chat.id)
          })
          .eq('id', startPayload);
      } catch (e) {
        console.log("Could not update profiles table directly, falling back:", e);
      }

      const fullName = metadata.full_name || "Athlete";
      await ctx.reply(`✅ Hello ${fullName}! Your Telegram account has been successfully linked to S Fitness.\n\nYou will receive your progress reports and workout check-ins here every two weeks! 🏋️💪`);
    } catch (err) {
      console.error("Linking error:", err);
      await ctx.reply("❌ Something went wrong linking your account. Please try again or contact support.");
    }
  } else {
    await ctx.reply(`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || "S Fitness"}! 🏋️\n\nI am your Member Assistant. You will receive workout updates and membership alerts here.\n\nTo link your account, please click "Link Device" in your dashboard or send me your registered email address here.`);
  }
});

bot.command("help", (ctx) => {
  ctx.reply("Send me your registered email address to link your gym account to this Telegram bot, or use the 'Link Device' button on your dashboard.");
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();

  // Simple email regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(text)) {
    await ctx.reply("Looking up account for email: " + text + "... ⏳");
    try {
      // Query all users from auth admin and find matching email
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error || !users) {
        await ctx.reply("❌ Error accessing accounts. Please try again later.");
        return;
      }

      const matchedUser = users.find(u => u.email?.toLowerCase() === text.toLowerCase());

      if (!matchedUser) {
        await ctx.reply("❌ No gym account found with that email address. Please make sure you registered with this email on the S Fitness portal.");
        return;
      }

      // Update metadata
      const metadata = matchedUser.user_metadata || {};
      const updatedMetadata = {
        ...metadata,
        telegram_chat_id: String(ctx.chat.id),
        telegram_linked: true
      };

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, {
        user_metadata: updatedMetadata
      });

      if (updateError) {
        throw updateError;
      }

      // Gracefully update profiles
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            telegram_chat_id: String(ctx.chat.id)
          })
          .eq('id', matchedUser.id);
      } catch (e) {
        console.log("Could not update profiles table directly, falling back:", e);
      }

      const fullName = metadata.full_name || "Athlete";
      await ctx.reply(`✅ Hello ${fullName}! Your Telegram account has been successfully linked to S Fitness.\n\nYou will receive your progress reports and workout check-ins here every two weeks! 🏋️💪`);
    } catch (err) {
      console.error("Linking error:", err);
      await ctx.reply("❌ Something went wrong linking your account. Please try again or contact support.");
    }
  } else {
    await ctx.reply("I received your message! If you want to link your gym account, please send your registered email address (e.g. user@example.com) or click 'Link Device' in your member dashboard.");
  }
});

// Export the webhook handler for Vercel
export const POST = webhookCallback(bot, "std/http");
