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
member_token = os.environ.get("TELEGRAM_MEMBER_BOT_TOKEN")

if not supabase_url or not supabase_service_key or not member_token:
    print("❌ Missing required environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and TELEGRAM_MEMBER_BOT_TOKEN are set.")
    sys.exit(1)

# Initialize Supabase Admin Client
supabase_admin: Client = create_client(supabase_url, supabase_service_key)

# Initialize Telegram Bot
bot = telebot.TeleBot(member_token)

@bot.message_handler(commands=['start'])
def handle_start(message):
    chat_id = str(message.chat.id)
    parts = message.text.split(maxsplit=1)
    start_payload = parts[1].strip() if len(parts) > 1 else None

    if start_payload:
        bot.send_message(chat_id, "Verifying your gym account... ⏳")
        try:
            # Look up the user using the admin API
            user_response = supabase_admin.auth.admin.get_user_by_id(start_payload)
            user = user_response.user

            if not user:
                bot.send_message(chat_id, "❌ Invalid verification link or account not found. Please click 'Link Device' directly from your dashboard.")
                return

            metadata = user.user_metadata or {}
            updated_metadata = {
                **metadata,
                "telegram_chat_id": chat_id,
                "telegram_linked": True
            }

            # Update user metadata in Auth.users
            supabase_admin.auth.admin.update_user_by_id(
                start_payload,
                attributes={"user_metadata": updated_metadata}
            )

            # Gracefully update the profiles table too if possible
            try:
                supabase_admin.table("profiles").update({
                    "telegram_chat_id": chat_id
                }).eq("id", start_payload).execute()
            except Exception as e:
                print(f"⚠️ Could not update profiles table directly, falling back: {e}")

            full_name = metadata.get("full_name", "Athlete")
            bot.send_message(
                chat_id, 
                f"✅ Hello {full_name}! Your Telegram account has been successfully linked to S Fitness.\n\nYou will receive your progress reports and workout check-ins here every two weeks! 🏋️💪"
            )
        except Exception as e:
            print(f"❌ Linking error: {e}")
            bot.send_message(chat_id, "❌ Something went wrong linking your account. Please try again or contact support.")
    else:
        app_name = os.environ.get("NEXT_PUBLIC_APP_NAME", "S Fitness")
        bot.send_message(
            chat_id,
            f"Welcome to {app_name}! 🏋️\n\nI am your Member Assistant. You will receive workout updates and membership alerts here.\n\nTo link your account, please click \"Link Device\" in your dashboard or send me your registered email address here."
        )

@bot.message_handler(commands=['help'])
def handle_help(message):
    chat_id = message.chat.id
    bot.send_message(
        chat_id,
        "Send me your registered email address to link your gym account to this Telegram bot, or use the 'Link Device' button on your dashboard."
    )

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    chat_id = str(message.chat.id)
    text = message.text.strip()

    # Simple email regex check
    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if re.match(email_regex, text):
        bot.send_message(chat_id, f"Looking up account for email: {text}... ⏳")
        try:
            # Query all users from auth admin and find matching email
            users_response = supabase_admin.auth.admin.list_users()
            users = users_response if isinstance(users_response, list) else (getattr(users_response, 'users', None) or [])

            if not users:
                bot.send_message(chat_id, "❌ Error accessing accounts. Please try again later.")
                return

            matched_user = None
            for u in users:
                if u.email and u.email.lower() == text.lower():
                    matched_user = u
                    break

            if not matched_user:
                bot.send_message(chat_id, "❌ No gym account found with that email address. Please make sure you registered with this email on the S Fitness portal.")
                return

            # Update metadata
            metadata = matched_user.user_metadata or {}
            updated_metadata = {
                **metadata,
                "telegram_chat_id": chat_id,
                "telegram_linked": True
            }

            supabase_admin.auth.admin.update_user_by_id(
                matched_user.id,
                attributes={"user_metadata": updated_metadata}
            )

            # Gracefully update profiles
            try:
                supabase_admin.table("profiles").update({
                    "telegram_chat_id": chat_id
                }).eq("id", matched_user.id).execute()
            except Exception as e:
                print(f"⚠️ Could not update profiles table directly, falling back: {e}")

            full_name = metadata.get("full_name", "Athlete")
            bot.send_message(
                chat_id,
                f"✅ Hello {full_name}! Your Telegram account has been successfully linked to S Fitness.\n\nYou will receive your progress reports and workout check-ins here every two weeks! 🏋️💪"
            )
        except Exception as e:
            print(f"❌ Linking error: {e}")
            bot.send_message(chat_id, "❌ Something went wrong linking your account. Please try again or contact support.")
    else:
        bot.send_message(
            chat_id,
            "I received your message! If you want to link your gym account, please send your registered email address (e.g. user@example.com) or click 'Link Device' in your member dashboard."
        )

if __name__ == "__main__":
    print("🚀 Starting Member Bot (Python) in long-polling mode...")
    try:
        bot.infinity_polling()
    except Exception as err:
        print(f"Error starting Member Bot: {err}")
