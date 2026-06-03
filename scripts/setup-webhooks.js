const { Bot } = require("grammy");
require("dotenv").config({ path: ".env.local" });

// Get tokens from env
const memberToken = process.env.TELEGRAM_MEMBER_BOT_TOKEN;
const trainerToken = process.env.TELEGRAM_TRAINER_BOT_TOKEN;
const domain = process.env.NEXT_PUBLIC_APP_URL;

if (!memberToken || !trainerToken || !domain) {
  console.error("❌ Missing required environment variables. Check your .env.local file.");
  console.error(`MEMBER_TOKEN: ${!!memberToken}, TRAINER_TOKEN: ${!!trainerToken}, DOMAIN: ${!!domain}`);
  process.exit(1);
}

async function setupWebhooks() {
  console.log(`Setting up webhooks for domain: ${domain}`);

  // Setup Member Bot
  const memberBot = new Bot(memberToken);
  const memberWebhookUrl = `${domain}/api/telegram/member`;
  await memberBot.api.setWebhook(memberWebhookUrl);
  console.log(`✅ Member Bot webhook set to: ${memberWebhookUrl}`);

  // Setup Trainer Bot
  const trainerBot = new Bot(trainerToken);
  const trainerWebhookUrl = `${domain}/api/telegram/trainer`;
  await trainerBot.api.setWebhook(trainerWebhookUrl);
  console.log(`✅ Trainer Bot webhook set to: ${trainerWebhookUrl}`);
  
  console.log("🎉 All webhooks configured successfully!");
}

setupWebhooks().catch(console.error);
