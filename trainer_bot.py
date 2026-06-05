import os
import re
import sys
import codecs

# Reconfigure stdout/stderr to utf-8 for Windows console emoji printing
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from pathlib import Path
import telebot
from supabase import create_client, Client

# Manually load .env and .env.local files for local long-polling consistency
def load_env():
    env_paths = [
        Path(__file__).parent / ".env",
        Path(__file__).parent / ".env.local"
    ]
    for env_path in env_paths:
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        match = re.match(r"^\s*([\w.-]+)\s*=\s*(.*)\s*$", line)
                        if match:
                            key = match.group(1).strip()
                            value = match.group(2).strip()
                            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                                value = value[1:-1]
                            if not os.environ.get(key):
                                os.environ[key] = value
            except Exception as e:
                print(f"⚠️ Error loading env from {env_path}: {e}")

load_env()

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
trainer_token = os.environ.get("TELEGRAM_TRAINER_BOT_TOKEN")
member_token = os.environ.get("TELEGRAM_MEMBER_BOT_TOKEN")

if not supabase_url or not supabase_service_key or not trainer_token or not member_token:
    print("❌ Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_TRAINER_BOT_TOKEN, and TELEGRAM_MEMBER_BOT_TOKEN are set.")
    sys.exit(1)

# Initialize Supabase Admin Client
supabase_admin: Client = create_client(supabase_url, supabase_service_key)

# Initialize Bots
bot = telebot.TeleBot(trainer_token)
member_bot = telebot.TeleBot(member_token)

@bot.message_handler(commands=['start'])
def handle_start(message):
    bot.reply_to(
        message,
        "🏆 *S FITNESS — TRAINER CONSOLE* 🏆\n\n"
        "Welcome back, Coach! I am your trainer management bot.\n\n"
        "⚙️ *Available Commands:*\n"
        "📊 /stats - General gym stats (member counts, Telegram adoptions)\n"
        "👥 /members - View active gym members and their performance goals\n"
        "✉️ `/notify <email_or_id> <message>` - Send a direct update to a member's Telegram chat\n\n"
        "Stay elite! 💪",
        parse_mode="Markdown"
    )

@bot.message_handler(commands=['stats'])
def handle_stats(message):
    chat_id = message.chat.id
    bot.send_message(chat_id, "Calculating gym statistics... 📊")
    try:
        users_response = supabase_admin.auth.admin.list_users()
        users = users_response.users or []

        # Get subscriptions
        sub_response = supabase_admin.table('subscriptions').select('status').execute()
        subscriptions = sub_response.data or []

        total_users = len(users)
        active_subscriptions = len([sub for sub in subscriptions if sub.get('status') == 'active'])
        linked_telegram_count = len([u for u in users if u.user_metadata and u.user_metadata.get('telegram_chat_id')])

        adoption_percentage = 0
        if total_users > 0:
            adoption_percentage = round((linked_telegram_count / total_users) * 100)

        stats_message = (
            f"📊 *S FITNESS — GYM STATUS REPORT* 📈\n\n"
            f"👤 *Total Registered Members:* {total_users}\n"
            f"💳 *Active Premium Subscriptions:* {active_subscriptions}\n"
            f"🔌 *Linked Telegram Devices:* {linked_telegram_count} / {total_users} ({adoption_percentage}%)\n\n"
            f"Keep building the community! 🚀"
        )
        bot.send_message(chat_id, stats_message, parse_mode="Markdown")
    except Exception as e:
        print(f"❌ Error fetching stats: {e}")
        bot.send_message(chat_id, "❌ Failed to compile statistics. Check console logs for details.")

@bot.message_handler(commands=['members'])
def handle_members(message):
    chat_id = message.chat.id
    bot.send_message(chat_id, "Fetching active gym members... 👥")
    try:
        users_response = supabase_admin.auth.admin.list_users()
        users = users_response.users or []

        sub_response = supabase_admin.table('subscriptions').select('user_id').eq('status', 'active').execute()
        active_subs = sub_response.data or []
        active_user_ids = {sub.get('user_id') for sub in active_subs if sub.get('user_id')}

        # Filter active members
        active_members = []
        for u in users:
            is_sub_active = u.id in active_user_ids
            is_test_user = u.email == 'testmember123@example.com' or (u.user_metadata and u.user_metadata.get('is_test') is True)
            if is_sub_active or is_test_user:
                active_members.append(u)

        if not active_members:
            bot.send_message(chat_id, "No active premium members found at the moment.")
            return

        members_list = f"👥 *ACTIVE MEMBERS ({len(active_members)}):*\n\n"
        for index, member in enumerate(active_members):
            meta = member.user_metadata or {}
            name = meta.get('full_name', 'Anonymous Athlete')
            email = member.email or 'No email'
            goal = meta.get('fitness_goal', 'Not set')
            weight = f"{meta.get('target_weight')} kg" if meta.get('target_weight') else 'Not set'
            tg_status = '✅ Linked' if meta.get('telegram_chat_id') else '❌ Unlinked'

            members_list += (
                f"{index + 1}. *{name}* ({email})\n"
                f"   🎯 Goal: {goal} | Weight Target: {weight}\n"
                f"   🔌 Bot Status: {tg_status}\n\n"
            )

        # Truncate if too long for Telegram limit (4096 chars)
        if len(members_list) > 4000:
            members_list = members_list[:3900] + "\n...[List truncated due to length]"

        bot.send_message(chat_id, members_list, parse_mode="Markdown")
    except Exception as e:
        print(f"❌ Error fetching members: {e}")
        bot.send_message(chat_id, "❌ Failed to retrieve members.")

@bot.message_handler(commands=['notify'])
def handle_notify(message):
    chat_id = message.chat.id
    match_content = telebot.util.extract_arguments(message.text)
    
    if not match_content:
        bot.send_message(
            chat_id,
            "❌ *Invalid format.*\n\n"
            "Use: `/notify <email_or_id> <your custom message here>`\n\n"
            "Example: `/notify testmember123@example.com Time to smash leg day!`",
            parse_mode="Markdown"
        )
        return

    # Split by first space to get target identifier vs message content
    parts = match_content.split(maxsplit=1)
    if len(parts) < 2:
        bot.send_message(chat_id, "❌ Please provide a message to send.")
        return

    target_identifier = parts[0].strip()
    custom_message = parts[1].strip()

    bot.send_message(chat_id, f"Searching for athlete matching *{target_identifier}*...", parse_mode="Markdown")

    try:
        users_response = supabase_admin.auth.admin.list_users()
        users = users_response.users or []

        matched_user = None
        for u in users:
            if (u.email and u.email.lower() == target_identifier.lower()) or u.id == target_identifier:
                matched_user = u
                break

        if not matched_user:
            bot.send_message(chat_id, f"❌ No user found matching the identifier: *{target_identifier}*", parse_mode="Markdown")
            return

        meta = matched_user.user_metadata or {}
        telegram_chat_id = meta.get('telegram_chat_id')
        if not telegram_chat_id:
            bot.send_message(
                chat_id, 
                f"❌ Athlete *{meta.get('full_name', matched_user.email)}* has not linked their Telegram bot yet.", 
                parse_mode="Markdown"
            )
            return

        athlete_name = meta.get('full_name', 'Athlete')
        message_to_send = (
            f"✉️ *COACH'S DIRECT NOTE* 🏆\n\n"
            f"Hello *{athlete_name}*,\n\n"
            f"{custom_message}\n\n"
            f"Keep grinding! 💪"
        )

        member_bot.send_message(telegram_chat_id, message_to_send, parse_mode="Markdown")
        bot.send_message(chat_id, f"✅ Direct message successfully delivered to *{athlete_name}* via Member Telegram Bot!", parse_mode="Markdown")

    except Exception as e:
        print(f"❌ Error sending notification: {e}")
        bot.send_message(chat_id, "❌ Failed to deliver message. Check bot tokens or chat configuration.")

@bot.message_handler(func=lambda message: True)
def handle_all(message):
    bot.reply_to(message, "I received your message! Try /start, /stats, /members, or `/notify`.")

if __name__ == "__main__":
    print("🚀 Starting Trainer Bot (Python) in long-polling mode...")
    try:
        bot.infinity_polling()
    except Exception as err:
        print(f"Error starting Trainer Bot: {err}")
