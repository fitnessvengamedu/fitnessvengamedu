import { Bot, webhookCallback } from "grammy";

// Create a new bot instance using the token from .env (with fallback for build time)
const bot = new Bot(process.env.TELEGRAM_MEMBER_BOT_TOKEN || "0000000000:dummy_member_token");

// Basic setup
bot.command("start", (ctx) => {
  ctx.reply(`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || "Fitness Gym"}! 🏋️\n\nI am your Member Assistant. You will receive workout updates and membership alerts here.`);
});

bot.command("help", (ctx) => {
  ctx.reply("Send me your registered email address to link your gym account to this Telegram bot.");
});

bot.on("message:text", (ctx) => {
  ctx.reply("I received your message, but I'm just a simple bot right now! Try /start or /help");
});

// Export the webhook handler for Vercel
export const POST = webhookCallback(bot, "std/http");
