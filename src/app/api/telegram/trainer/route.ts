import { Bot, webhookCallback } from "grammy";

// Create a new bot instance using the token from .env
const bot = new Bot(process.env.TELEGRAM_TRAINER_BOT_TOKEN || "");

// Basic setup
bot.command("start", (ctx) => {
  ctx.reply("Welcome back, Coach! 🏆\n\nI am your Trainer Assistant. I will notify you here when new members join or when workouts are completed.");
});

bot.command("members", (ctx) => {
  ctx.reply("Here are the latest members who need attention:\n1. John Doe (Joined today)\n2. Jane Smith (Payment pending)");
});

bot.on("message:text", (ctx) => {
  ctx.reply("I received your message, but I'm just a simple trainer bot right now! Try /start or /members");
});

// Export the webhook handler for Vercel
export const POST = webhookCallback(bot, "std/http");
