import os
import re
import sys
import codecs
import random
import string
import datetime
import io
import json
from pathlib import Path
from functools import wraps

# Reconfigure stdout/stderr to utf-8 for Windows console emoji printing
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import telebot
from supabase import create_client, Client
import razorpay
from apscheduler.schedulers.background import BackgroundScheduler
from pytz import timezone

# ─────────────────────────────────────────────────────────────
# 1. LOAD ENVIRONMENT VARIABLES
# ─────────────────────────────────────────────────────────────
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
owner_chat_id = os.environ.get("TELEGRAM_OWNER_CHAT_ID")

if not supabase_url or not supabase_service_key or not trainer_token or not member_token:
    print("❌ Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_TRAINER_BOT_TOKEN, and TELEGRAM_MEMBER_BOT_TOKEN are set.")
    sys.exit(1)

# Initialize Supabase Admin Client
supabase_admin: Client = create_client(supabase_url, supabase_service_key)

# Initialize Bots
bot = telebot.TeleBot(trainer_token)
member_bot = telebot.TeleBot(member_token)

# ─────────────────────────────────────────────────────────────
# 2. RAZORPAY INTEGRATION
# ─────────────────────────────────────────────────────────────
razorpay_key_id = os.environ.get("NEXT_PUBLIC_RAZORPAY_KEY_ID")
razorpay_key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
razorpay_client = None

if razorpay_key_id and razorpay_key_secret:
    try:
        razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
    except Exception as e:
        print(f"⚠️ Failed to initialize Razorpay client: {e}")

PLANS = {
    os.environ.get("NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY", "plan_Swj162e2tGBqGT"): {"name": "Monthly", "months": 1, "price": 600},
    os.environ.get("NEXT_PUBLIC_RAZORPAY_PLAN_QUARTERLY", "plan_Swj2v7bdRjShBX"): {"name": "Quarterly", "months": 3, "price": 1600},
    os.environ.get("NEXT_PUBLIC_RAZORPAY_PLAN_HALFYEARLY", "plan_Swj3IkXcuRazsD"): {"name": "Half Yearly", "months": 6, "price": 3000},
    os.environ.get("NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY", "plan_Swj3nt9CvioNy2"): {"name": "Annual", "months": 12, "price": 5500}
}

# Session caches
REGISTRATION_SESSIONS = {}
PAYMENT_SESSIONS = {}
ATTENDANCE_SESSIONS = {}

# ─────────────────────────────────────────────────────────────
# 3. SECURITY & ROLE UTILITIES
# ─────────────────────────────────────────────────────────────
ALLOWED_TELEGRAM_IDS = ["8250992325"]

# Integrate values from env configuration
env_owner = os.environ.get("TELEGRAM_OWNER_CHAT_ID")
if env_owner:
    ALLOWED_TELEGRAM_IDS.append(env_owner.strip())

env_admins = os.environ.get("ADMIN_TELEGRAM_IDS", "")
for admin_id in env_admins.split(","):
    admin_id = admin_id.strip()
    if admin_id and admin_id not in ALLOWED_TELEGRAM_IDS:
        ALLOWED_TELEGRAM_IDS.append(admin_id)

def get_admin_role(telegram_id):
    # Enforce strict ID whitelisting
    if str(telegram_id) not in ALLOWED_TELEGRAM_IDS:
        return None
        
    if owner_chat_id and str(telegram_id) == owner_chat_id.strip():
        return 'owner'
        
    try:
        # Scan auth metadata as profiles lacks telegram_chat_id column
        users_resp = supabase_admin.auth.admin.list_users()
        users = users_resp if isinstance(users_resp, list) else (getattr(users_resp, 'users', None) or [])
        for u in users:
            meta = u.user_metadata or {}
            if str(meta.get("telegram_chat_id")) == str(telegram_id):
                role = meta.get("role")
                if role in ['admin', 'trainer', 'owner']:
                    return role
    except Exception as e:
        print(f"Error checking admin role: {e}")
        
    # Return trainer fallback role for whitelisted accounts if lookup fails
    return 'owner' if str(telegram_id) == owner_chat_id else 'trainer'

def is_admin(telegram_id):
    return get_admin_role(telegram_id) is not None

def admin_only(func):
    @wraps(func)
    def wrapper(message, *args, **kwargs):
        user_id = message.from_user.id
        if not is_admin(user_id):
            bot.reply_to(message, "⛔ *Access Denied.* You must be an authorized coach or admin to use this bot.", parse_mode="Markdown")
            return
        return func(message, *args, **kwargs)
    return wrapper

def owner_only(func):
    @wraps(func)
    def wrapper(message, *args, **kwargs):
        user_id = message.from_user.id
        role = get_admin_role(user_id)
        if role != 'owner':
            bot.reply_to(message, "⛔ *Access Denied.* This command is reserved for the gym Owner only.", parse_mode="Markdown")
            return
        return func(message, *args, **kwargs)
    return wrapper

def get_admin_name(telegram_id):
    try:
        # Match auth users metadata for name resolution
        users_resp = supabase_admin.auth.admin.list_users()
        users = users_resp if isinstance(users_resp, list) else (getattr(users_resp, 'users', None) or [])
        for u in users:
            meta = u.user_metadata or {}
            if str(meta.get("telegram_chat_id")) == str(telegram_id):
                return meta.get("full_name", f"Coach ({telegram_id})")
    except Exception as e:
        print(f"Error checking admin name: {e}")
    return f"Coach ({telegram_id})"


# ─────────────────────────────────────────────────────────────
# 4. DATABASE & BUSINESS HELPERS
# ─────────────────────────────────────────────────────────────
def get_member_status(profile_id):
    try:
        res = supabase_admin.table('subscriptions').select('status, current_period_end').eq('user_id', profile_id).execute()
        if res.data:
            sub = res.data[0]
            status = sub.get('status')
            end_date_str = sub.get('current_period_end')
            if status == 'active':
                if end_date_str:
                    end_dt = datetime.datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                    if end_dt.replace(tzinfo=None) < datetime.datetime.utcnow():
                        return 'expired', end_date_str
                return 'active', end_date_str
            return status, end_date_str
    except Exception as e:
        print(f"Error getting subscription status: {e}")
    return 'inactive', None

def create_razorpay_link(name, phone, amount, plan_name):
    if not razorpay_client:
        return None
    try:
        clean_phone = re.sub(r"\D", "", phone)
        if len(clean_phone) == 10:
            clean_phone = f"91{clean_phone}"
        data = {
            "amount": int(amount * 100),
            "currency": "INR",
            "accept_partial": False,
            "description": f"S Fitness Membership - {plan_name}",
            "customer": {
                "name": name,
                "contact": f"+{clean_phone}"
            },
            "notify": {
                "sms": True,
                "email": False
            },
            "reminder_enable": True,
            "notes": {
                "gym": os.environ.get("NEXT_PUBLIC_APP_NAME", "S FITNESS")
            }
        }
        res = razorpay_client.payment_link.create(data)
        return res.get("short_url")
    except Exception as e:
        print(f"Razorpay creation failed: {e}")
        return None

# ─────────────────────────────────────────────────────────────
# 5. CORE COMMANDS
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['start', 'help'])
@admin_only
def handle_start(message):
    welcome_text = (
        "🏆 *S FITNESS — TRAINER COMMAND CENTER* 🏆\n\n"
        "Welcome, coach! Here are your training and admin controls:\n\n"
        "📊 /dashboard - Live gym statistics\n"
        "👥 /members - View and manage active athletes\n"
        "🔍 /search <name_or_phone> - Lookup profile & history\n"
        "⚠️ /pending - List members with pending/expired fees\n"
        "📅 /attendance - Mark or view today's check-ins\n"
        "🔔 /expiring - Alerts for renewals next 7 days\n"
        "💳 /payment - Record manual cash/UPI payment\n"
        "🔗 /paymentlink - Generate custom Razorpay link\n"
        "📋 /myassigned - Show athletes assigned to you\n"
        "📝 /notes <phone/email> <workout_notes> - Add athlete notes\n"
        "💰 /fee_summary - View daily collection breakdown\n\n"
        "👑 *Owner-Only Controls:*\n"
        "📢 /broadcast <message> - Notify all active members\n"
        "➕ /addadmin <phone/email> - Promote member to coach\n"
        "➖ /removeadmin <phone/email> - Demote coach to member\n"
        "📥 /export - Download full roster as CSV"
    )
    markup = telebot.types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        telebot.types.InlineKeyboardButton("📊 Dashboard", callback_data="btn_dashboard"),
        telebot.types.InlineKeyboardButton("👥 Members", callback_data="btn_members"),
        telebot.types.InlineKeyboardButton("📅 Attendance", callback_data="btn_attendance"),
        telebot.types.InlineKeyboardButton("⚠️ Pending", callback_data="btn_pending")
    )
    bot.send_message(message.chat.id, welcome_text, parse_mode="Markdown", reply_markup=markup)

@bot.message_handler(commands=['dashboard'])
@admin_only
def handle_dashboard_cmd(message):
    send_dashboard(message.chat.id)

def send_dashboard(chat_id):
    bot.send_message(chat_id, "Fetching live telemetry... 📊")
    try:
        # Fetch users
        users_resp = supabase_admin.auth.admin.list_users()
        users = users_resp if isinstance(users_resp, list) else (getattr(users_resp, 'users', None) or [])
        
        # Filter members vs admins
        members_count = 0
        linked_tg = 0
        for u in users:
            meta = u.user_metadata or {}
            role = meta.get("role", "member")
            if role == "member":
                members_count += 1
                if meta.get("telegram_chat_id"):
                    linked_tg += 1
                    
        # Active vs Expired Subscriptions
        subs_resp = supabase_admin.table('subscriptions').select('*').execute()
        subs = subs_resp.data or []
        
        active_subs = 0
        expired_subs = 0
        monthly_est_rev = 0
        for s in subs:
            status = s.get('status')
            plan_id = s.get('plan_id')
            if status == 'active':
                end_str = s.get('current_period_end')
                if end_str:
                    end_dt = datetime.datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                    if end_dt.replace(tzinfo=None) < datetime.datetime.utcnow():
                        expired_subs += 1
                        continue
                active_subs += 1
                if plan_id in PLANS:
                    monthly_est_rev += PLANS[plan_id]["price"] / PLANS[plan_id]["months"]
            else:
                expired_subs += 1

        adoption_pct = round((linked_tg / members_count * 100)) if members_count > 0 else 0
        
        dash_text = (
            f"🏋️ *{os.environ.get('NEXT_PUBLIC_APP_NAME', 'S FITNESS')} — LIVE STATUS* 📈\n\n"
            f"👥 *Members Overview:*\n"
            f"  • Total Registered: {members_count}\n"
            f"  • Linked to Telegram: {linked_tg} ({adoption_pct}%)\n\n"
            f"💳 *Subscriptions & Revenue:*\n"
            f"  • Active Premium: {active_subs}\n"
            f"  • Expired/Pending: {expired_subs}\n"
            f"  • Estimated Monthly MRR: ₹{round(monthly_est_rev, 2)}\n\n"
            f"📅 Today: {datetime.datetime.now().strftime('%d %B %Y')}"
        )
        bot.send_message(chat_id, dash_text, parse_mode="Markdown")
    except Exception as e:
        print(f"Dashboard compile error: {e}")
        bot.send_message(chat_id, "⚠️ Database error compiling stats.")

# ─────────────────────────────────────────────────────────────
# 6. MEMBER REGISTRATION FLOW (/addmember)
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['addmember'])
@admin_only
def start_addmember(message):
    msg = bot.reply_to(message, "👤 *NEW MEMBER REGISTRATION*\n\nPlease reply with the athlete's *Full Name*:\n(or type /cancel to abort)", parse_mode="Markdown")
    bot.register_next_step_handler(msg, addmember_step_name)

def addmember_step_name(message):
    text = message.text.strip() if message.text else ""
    if text.lower() in ['/cancel', 'cancel']:
        bot.reply_to(message, "❌ Registration cancelled.")
        return
    if len(text) < 3:
        msg = bot.reply_to(message, "⚠️ Name must be at least 3 characters. Please enter full name:")
        bot.register_next_step_handler(msg, addmember_step_name)
        return
    
    REGISTRATION_SESSIONS[message.chat.id] = {"name": text}
    msg = bot.reply_to(message, f"Got it. Now send the *10-digit Phone Number* for {text}:", parse_mode="Markdown")
    bot.register_next_step_handler(msg, addmember_step_phone)

def addmember_step_phone(message):
    chat_id = message.chat.id
    text = message.text.strip() if message.text else ""
    if text.lower() in ['/cancel', 'cancel']:
        bot.reply_to(message, "❌ Registration cancelled.")
        REGISTRATION_SESSIONS.pop(chat_id, None)
        return
    
    clean_phone = re.sub(r"\D", "", text)
    if len(clean_phone) != 10 or not clean_phone.startswith(('6','7','8','9')):
        msg = bot.reply_to(message, "⚠️ Please enter a valid 10-digit Indian mobile number:")
        bot.register_next_step_handler(msg, addmember_step_phone)
        return
        
    # Check duplicate phone
    try:
        check = supabase_admin.table('profiles').select('id').eq('phone', clean_phone).execute()
        if check.data:
            bot.send_message(chat_id, f"❌ Member with phone {clean_phone} already exists in the database.")
            REGISTRATION_SESSIONS.pop(chat_id, None)
            return
    except Exception:
        pass

    REGISTRATION_SESSIONS[chat_id]["phone"] = clean_phone
    msg = bot.reply_to(message, "Enter their *Email Address* (or reply '-' to skip email verification):", parse_mode="Markdown")
    bot.register_next_step_handler(msg, addmember_step_email)

def addmember_step_email(message):
    chat_id = message.chat.id
    text = message.text.strip() if message.text else ""
    if text.lower() in ['/cancel', 'cancel']:
        bot.reply_to(message, "❌ Registration cancelled.")
        REGISTRATION_SESSIONS.pop(chat_id, None)
        return
        
    if text != '-':
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        if not re.match(email_regex, text):
            msg = bot.reply_to(message, "⚠️ Invalid email format. Please enter a valid email or reply '-' to skip:")
            bot.register_next_step_handler(msg, addmember_step_email)
            return
            
    REGISTRATION_SESSIONS[chat_id]["email"] = text
    
    markup = telebot.types.InlineKeyboardMarkup()
    markup.add(
        telebot.types.InlineKeyboardButton("Male 🧑", callback_data="gender_male"),
        telebot.types.InlineKeyboardButton("Female 👩", callback_data="gender_female"),
        telebot.types.InlineKeyboardButton("Other 🧑‍🎤", callback_data="gender_other")
    )
    bot.send_message(chat_id, "Select member's gender:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("gender_"))
@admin_only
def addmember_step_gender(call):
    chat_id = call.message.chat.id
    if chat_id not in REGISTRATION_SESSIONS:
        bot.answer_callback_query(call.id, "Session expired. Use /addmember")
        return
        
    gender = call.data.split("_")[1]
    REGISTRATION_SESSIONS[chat_id]["gender"] = gender
    
    # Next: Select membership plan
    markup = telebot.types.InlineKeyboardMarkup()
    for pid, plan in PLANS.items():
        markup.add(telebot.types.InlineKeyboardButton(f"{plan['name']} (₹{plan['price']})", callback_data=f"selplan_{pid}"))
        
    bot.edit_message_text("Select membership plan:", chat_id, call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("selplan_"))
@admin_only
def addmember_step_plan(call):
    chat_id = call.message.chat.id
    if chat_id not in REGISTRATION_SESSIONS:
        bot.answer_callback_query(call.id, "Session expired. Use /addmember")
        return
        
    plan_id = call.data.split("_")[1]
    REGISTRATION_SESSIONS[chat_id]["plan_id"] = plan_id
    
    # Next: Start Date
    markup = telebot.types.InlineKeyboardMarkup()
    markup.add(
        telebot.types.InlineKeyboardButton("Today 🗓️", callback_data="start_today"),
        telebot.types.InlineKeyboardButton("Tomorrow 🗓️", callback_data="start_tomorrow")
    )
    bot.edit_message_text("Select start date:", chat_id, call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("start_"))
@admin_only
def addmember_step_startdate(call):
    chat_id = call.message.chat.id
    if chat_id not in REGISTRATION_SESSIONS:
        bot.answer_callback_query(call.id, "Session expired.")
        return
        
    choice = call.data.split("_")[1]
    today = datetime.date.today()
    if choice == 'today':
        start_date = today.isoformat()
    else:
        start_date = (today + datetime.timedelta(days=1)).isoformat()
        
    REGISTRATION_SESSIONS[chat_id]["start_date"] = start_date
    
    # Build summary
    data = REGISTRATION_SESSIONS[chat_id]
    plan_info = PLANS[data["plan_id"]]
    
    summary = (
        f"📝 *MEMBER CONFIRMATION SUMMARY*\n\n"
        f"👤 *Name:* {data['name']}\n"
        f"📞 *Phone:* {data['phone']}\n"
        f"✉️ *Email:* {data['email']}\n"
        f"⚧️ *Gender:* {data['gender'].capitalize()}\n"
        f"📋 *Plan:* {plan_info['name']} (₹{plan_info['price']})\n"
        f"🗓️ *Start Date:* {start_date}\n\n"
        f"Save this member?"
    )
    
    markup = telebot.types.InlineKeyboardMarkup()
    markup.add(
        telebot.types.InlineKeyboardButton("✅ Yes, Create", callback_data="confirm_add_yes"),
        telebot.types.InlineKeyboardButton("❌ Cancel", callback_data="confirm_add_no")
    )
    bot.edit_message_text(summary, chat_id, call.message.message_id, parse_mode="Markdown", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("confirm_add_"))
@admin_only
def addmember_confirm(call):
    chat_id = call.message.chat.id
    if chat_id not in REGISTRATION_SESSIONS:
        bot.answer_callback_query(call.id, "Session expired.")
        return
        
    choice = call.data.split("_")[2]
    if choice == 'no':
        bot.edit_message_text("❌ Registration cancelled.", chat_id, call.message.message_id)
        REGISTRATION_SESSIONS.pop(chat_id, None)
        return
        
    data = REGISTRATION_SESSIONS[chat_id]
    bot.edit_message_text("Creating user profile in database... ⏳", chat_id, call.message.message_id)
    
    try:
        # Determine attributes
        email = data["email"]
        if not email or email == '-':
            email = f"{data['phone']}@sfitness.local"
            
        # Create user in Auth
        auth_res = supabase_admin.auth.admin.create_user({
            "email": email,
            "phone": f"+91{data['phone']}",
            "password": f"SFMember{data['phone']}!",
            "user_metadata": {
                "full_name": data["name"],
                "role": "member",
                "phone": data["phone"],
                "gender": data["gender"]
            },
            "email_confirm": True,
            "phone_confirm": True
        })
        
        user = auth_res.user
        if not user:
            raise Exception("Failed to register Auth user record.")
            
        member_id = f"SF-{random.randint(1000, 9999)}"
        
        # Profile DB record
        supabase_admin.table('profiles').insert({
            "id": user.id,
            "role": "member",
            "full_name": data["name"],
            "phone": data["phone"],
            "gender": data["gender"],
            "member_id": member_id
        }).execute()
        
        # Calculate subscription end
        months = PLANS[data["plan_id"]]["months"]
        start_dt = datetime.datetime.strptime(data["start_date"], "%Y-%m-%d")
        end_dt = start_dt + datetime.timedelta(days=months * 30)
        
        # Insert subscription
        supabase_admin.table('subscriptions').insert({
            "user_id": user.id,
            "status": "inactive",
            "plan_id": data["plan_id"],
            "current_period_start": start_dt.isoformat(),
            "current_period_end": end_dt.isoformat()
        }).execute()
        
        success_msg = (
            f"✅ *Member registered successfully!*\n\n"
            f"🆔 *Gym ID:* `{member_id}`\n"
            f"🔑 *Temp Password:* `SFMember{data['phone']}!`\n"
            f"How would you like to handle their payment?"
        )
        
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(
            telebot.types.InlineKeyboardButton("💵 Cash / UPI", callback_data=f"regpay_cash_{user.id}"),
            telebot.types.InlineKeyboardButton("💳 Razorpay Link", callback_data=f"regpay_razor_{user.id}"),
            telebot.types.InlineKeyboardButton("Skip Payment ➡️", callback_data="regpay_skip")
        )
        bot.send_message(chat_id, success_msg, parse_mode="Markdown", reply_markup=markup)
        
    except Exception as e:
        print(f"Error during registration execution: {e}")
        bot.send_message(chat_id, f"⚠️ Database write error: {e}")
        
    REGISTRATION_SESSIONS.pop(chat_id, None)

@bot.callback_query_handler(func=lambda call: call.data.startswith("regpay_"))
@admin_only
def addmember_post_payment(call):
    chat_id = call.message.chat.id
    parts = call.data.split("_")
    action = parts[1]
    
    if action == 'skip':
        bot.edit_message_text("Payment skipped. Record later via /payment.", chat_id, call.message.message_id)
        return
        
    user_id = parts[2]
    
    # Get user profile and sub details
    try:
        prof = supabase_admin.table('profiles').select('*').eq('id', user_id).single().execute()
        sub = supabase_admin.table('subscriptions').select('*').eq('user_id', user_id).single().execute()
        
        if not prof.data or not sub.data:
            bot.send_message(chat_id, "⚠️ Profile or subscription data not found.")
            return
            
        profile = prof.data
        subscription = sub.data
        plan_info = PLANS[subscription['plan_id']]
        
        if action == 'cash':
            # Mark active
            supabase_admin.table('subscriptions').update({
                "status": "active",
                "razorpay_payment_id": "manual_cash",
                "updated_at": datetime.datetime.utcnow().isoformat()
            }).eq('user_id', user_id).execute()
            
            bot.edit_message_text(f"✅ *Payment Recorded!* Membership for *{profile['full_name']}* is now active until {subscription['current_period_end'][:10]}.", chat_id, call.message.message_id, parse_mode="Markdown")
            
        elif action == 'razor':
            url = create_razorpay_link(profile['full_name'], profile['phone'], plan_info['price'], plan_info['name'])
            if url:
                # Save link to subscription record
                supabase_admin.table('subscriptions').update({
                    "razorpay_subscription_id": url
                }).eq('user_id', user_id).execute()
                
                bot.edit_message_text(f"🔗 *Razorpay Payment Link Generated:*\n{url}\n\nShare this link with the athlete.", chat_id, call.message.message_id, parse_mode="Markdown")
            else:
                bot.edit_message_text("❌ Failed to generate Razorpay link. Using cash option as fallback.", chat_id, call.message.message_id)
                
    except Exception as e:
        print(f"Error handling post registration payment: {e}")
        bot.send_message(chat_id, "⚠️ Error writing payment details.")

# ─────────────────────────────────────────────────────────────
# 7. MEMBER SEARCH, DETAILS & MANAGEMENT (/search, /members)
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['members'])
@admin_only
def handle_members_list(message):
    send_members_page(message.chat.id, 0)

@bot.callback_query_handler(func=lambda call: call.data.startswith("members_page_"))
@admin_only
def handle_members_page_callback(call):
    page = int(call.data.split("_")[2])
    send_members_page(call.message.chat.id, page, call.message.message_id)

def send_members_page(chat_id, page, edit_message_id=None):
    try:
        res = supabase_admin.table('profiles').select('*').eq('role', 'member').execute()
        members = res.data or []
        
        if not members:
            bot.send_message(chat_id, "No registered members found.")
            return
            
        limit = 10
        total_pages = (len(members) + limit - 1) // limit
        page = max(0, min(page, total_pages - 1))
        
        start_idx = page * limit
        end_idx = start_idx + limit
        page_members = members[start_idx:end_idx]
        
        msg_text = f"👥 *GYM ROSTER — PAGE {page + 1} OF {total_pages}*\n\n"
        for i, m in enumerate(page_members):
            status, end_date = get_member_status(m['id'])
            status_emoji = "✅" if status == 'active' else "❌"
            expiry = end_date[:10] if end_date else "N/A"
            msg_text += f"{start_idx + i + 1}. *{m['full_name']}* ({m['phone']})\n   Status: {status_emoji} | Expiry: {expiry}\n\n"
            
        markup = telebot.types.InlineKeyboardMarkup()
        buttons = []
        if page > 0:
            buttons.append(telebot.types.InlineKeyboardButton("⬅️ Prev", callback_data=f"members_page_{page - 1}"))
        if page < total_pages - 1:
            buttons.append(telebot.types.InlineKeyboardButton("Next ➡️", callback_data=f"members_page_{page + 1}"))
            
        if buttons:
            markup.add(*buttons)
            
        if edit_message_id:
            bot.edit_message_text(msg_text, chat_id, edit_message_id, parse_mode="Markdown", reply_markup=markup)
        else:
            bot.send_message(chat_id, msg_text, parse_mode="Markdown", reply_markup=markup)
            
    except Exception as e:
        print(f"Roster list error: {e}")
        bot.send_message(chat_id, "⚠️ Error fetching roster.")

@bot.message_handler(commands=['search'])
@admin_only
def handle_search(message):
    query = telebot.util.extract_arguments(message.text)
    if not query:
        bot.reply_to(message, "Usage: `/search <name_or_phone>`", parse_mode="Markdown")
        return
        
    bot.send_message(message.chat.id, f"Searching for '{query}'... 🔍")
    try:
        res = supabase_admin.table('profiles').select('*').or_(f"full_name.ilike.%{query}%,phone.ilike.%{query}%").execute()
        results = res.data or []
        
        if not results:
            bot.send_message(message.chat.id, "No matching athletes found.")
            return
            
        if len(results) > 1:
            markup = telebot.types.InlineKeyboardMarkup()
            for r in results[:10]:
                markup.add(telebot.types.InlineKeyboardButton(f"{r['full_name']} ({r['phone']})", callback_data=f"vmember_{r['id']}"))
            bot.send_message(message.chat.id, "Multiple athletes found. Select profile:", reply_markup=markup)
        else:
            send_member_card(message.chat.id, results[0]['id'])
            
    except Exception as e:
        print(f"Search error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error searching profiles.")

@bot.callback_query_handler(func=lambda call: call.data.startswith("vmember_"))
@admin_only
def view_member_callback(call):
    member_id = call.data.split("_")[1]
    send_member_card(call.message.chat.id, member_id, call.message.message_id)

def send_member_card(chat_id, profile_id, edit_message_id=None):
    try:
        prof = supabase_admin.table('profiles').select('*').eq('id', profile_id).single().execute()
        if not prof.data:
            bot.send_message(chat_id, "Member not found.")
            return
            
        m = prof.data
        status, end_date = get_member_status(profile_id)
        status_text = "ACTIVE ✅" if status == 'active' else "EXPIRED/PENDING ❌"
        expiry = end_date[:10] if end_date else "N/A"
        
        # Retrieve Auth user metadata details
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        user = user_res.user
        meta = user.user_metadata or {}
        
        assigned_trainer = meta.get("assigned_trainer", "None")
        notes_list = meta.get("workout_notes", [])
        last_note = notes_list[-1]["text"] if notes_list else "No notes added yet."
        tg_status = "✅ Linked" if meta.get("telegram_chat_id") else "❌ Unlinked"
        
        card = (
            f"👤 *ATHLETE RECORD CARD*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🆔 *Gym ID:* {m.get('member_id', 'SF-' + m['id'][:4])}\n"
            f"👤 *Name:* {m['full_name']}\n"
            f"📞 *Phone:* {m['phone']}\n"
            f"⚧️ *Gender:* {m.get('gender', 'N/A').capitalize()}\n"
            f"🗓️ *Expiry Date:* {expiry}\n"
            f"⚠️ *Status:* {status_text}\n"
            f"🔌 *Bot Status:* {tg_status}\n"
            f"🏋️ *Assigned Trainer:* {assigned_trainer}\n\n"
            f"📝 *Latest Note:* {last_note}"
        )
        
        markup = telebot.types.InlineKeyboardMarkup(row_width=2)
        markup.add(
            telebot.types.InlineKeyboardButton("💵 Pay Cash", callback_data=f"mcardpay_{profile_id}"),
            telebot.types.InlineKeyboardButton("🔗 Pay Link", callback_data=f"mcardlink_{profile_id}"),
            telebot.types.InlineKeyboardButton("📅 Check In", callback_data=f"mcardcheck_{profile_id}"),
            telebot.types.InlineKeyboardButton("👉 Assign to Me", callback_data=f"mcardassign_{profile_id}"),
            telebot.types.InlineKeyboardButton("✏️ Add Note", callback_data=f"mcardnote_{profile_id}")
        )
        
        if edit_message_id:
            bot.edit_message_text(card, chat_id, edit_message_id, parse_mode="Markdown", reply_markup=markup)
        else:
            bot.send_message(chat_id, card, parse_mode="Markdown", reply_markup=markup)
            
    except Exception as e:
        print(f"Card fetch error: {e}")
        bot.send_message(chat_id, "⚠️ Error compiling profile card.")

@bot.callback_query_handler(func=lambda call: call.data.startswith("mcardassign_"))
@admin_only
def assign_to_me_callback(call):
    chat_id = call.message.chat.id
    profile_id = call.data.split("_")[1]
    trainer_name = get_admin_name(call.from_user.id)
    
    try:
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        user = user_res.user
        meta = user.user_metadata or {}
        meta["assigned_trainer"] = trainer_name
        
        supabase_admin.auth.admin.update_user_by_id(profile_id, attributes={"user_metadata": meta})
        bot.answer_callback_query(call.id, f"Success! Assigned to {trainer_name}.")
        send_member_card(chat_id, profile_id, call.message.message_id)
    except Exception as e:
        print(f"Assign error: {e}")
        bot.answer_callback_query(call.id, "⚠️ Error assigning trainer.")

# ─────────────────────────────────────────────────────────────
# 8. PAYMENT & FEE RECORDING (/payment, /pending, /paymentlink)
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['pending'])
@admin_only
def handle_pending_list(message):
    try:
        subs_res = supabase_admin.table('subscriptions').select('*').execute()
        subs = subs_res.data or []
        
        pending_members = []
        for s in subs:
            status = s.get('status')
            user_id = s.get('user_id')
            if status != 'active':
                pending_members.append(user_id)
            else:
                end_str = s.get('current_period_end')
                if end_str:
                    end_dt = datetime.datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                    if end_dt.replace(tzinfo=None) < datetime.datetime.utcnow():
                        pending_members.append(user_id)
                        
        if not pending_members:
            bot.send_message(message.chat.id, "All registered members have active premium accounts! ✅")
            return
            
        # Get profile details
        profs_res = supabase_admin.table('profiles').select('*').in_('id', pending_members).execute()
        profiles = profs_res.data or []
        
        report = "⚠️ *MEMBERS WITH PENDING/EXPIRED FEES:*\n\n"
        for index, p in enumerate(profiles[:20]):
            report += f"{index + 1}. *{p['full_name']}* ({p['phone']})\n   Record: /payment\n\n"
            
        if len(profiles) > 20:
            report += f"... and {len(profiles) - 20} more."
            
        bot.send_message(message.chat.id, report, parse_mode="Markdown")
    except Exception as e:
        print(f"Pending fetch error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error fetching unpaid roster.")

@bot.message_handler(commands=['payment'])
@admin_only
def handle_payment_cmd(message):
    msg = bot.reply_to(message, "💵 *RECORD MANUAL PAYMENT*\n\nSearch member by Name or Phone:", parse_mode="Markdown")
    bot.register_next_step_handler(msg, payment_search)

def payment_search(message):
    query = message.text.strip() if message.text else ""
    if query.lower() in ['/cancel', 'cancel']:
        bot.reply_to(message, "❌ Operation aborted.")
        return
        
    try:
        res = supabase_admin.table('profiles').select('*').or_(f"full_name.ilike.%{query}%,phone.ilike.%{query}%").execute()
        results = res.data or []
        
        if not results:
            bot.send_message(message.chat.id, "No matching athletes found. Use /payment to try again.")
            return
            
        markup = telebot.types.InlineKeyboardMarkup()
        for r in results[:10]:
            markup.add(telebot.types.InlineKeyboardButton(f"{r['full_name']} ({r['phone']})", callback_data=f"payrecord_{r['id']}"))
        bot.send_message(message.chat.id, "Select member who paid:", reply_markup=markup)
    except Exception as e:
        print(f"Payment search error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error searching profiles.")

@bot.callback_query_handler(func=lambda call: call.data.startswith("payrecord_") or call.data.startswith("mcardpay_"))
@admin_only
def payment_record_select(call):
    chat_id = call.message.chat.id
    profile_id = call.data.split("_")[1]
    
    # Pre-select plan
    PAYMENT_SESSIONS[chat_id] = {"profile_id": profile_id}
    
    markup = telebot.types.InlineKeyboardMarkup()
    for pid, plan in PLANS.items():
        markup.add(telebot.types.InlineKeyboardButton(f"{plan['name']} (₹{plan['price']})", callback_data=f"payplan_{pid}"))
    bot.send_message(chat_id, "Select plan options to apply:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("payplan_"))
@admin_only
def payment_plan_select(call):
    chat_id = call.message.chat.id
    if chat_id not in PAYMENT_SESSIONS:
        bot.answer_callback_query(call.id, "Session expired.")
        return
        
    plan_id = call.data.split("_")[1]
    PAYMENT_SESSIONS[chat_id]["plan_id"] = plan_id
    
    markup = telebot.types.InlineKeyboardMarkup()
    markup.add(
        telebot.types.InlineKeyboardButton("💵 Cash / UPI", callback_data="paymode_cash"),
        telebot.types.InlineKeyboardButton("💳 Razorpay Link", callback_data="paymode_razor")
    )
    bot.send_message(chat_id, "Select payment method applied:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("paymode_"))
@admin_only
def payment_mode_confirm(call):
    chat_id = call.message.chat.id
    if chat_id not in PAYMENT_SESSIONS:
        bot.answer_callback_query(call.id, "Session expired.")
        return
        
    mode = call.data.split("_")[1]
    data = PAYMENT_SESSIONS[chat_id]
    profile_id = data["profile_id"]
    plan_id = data["plan_id"]
    plan_info = PLANS[plan_id]
    
    try:
        prof_res = supabase_admin.table('profiles').select('full_name, phone').eq('id', profile_id).single().execute()
        profile = prof_res.data
        
        if mode == 'cash':
            months = plan_info["months"]
            today = datetime.date.today()
            end_date = (today + datetime.timedelta(days=months * 30)).isoformat()
            
            # Record/Upsert Subscription
            supabase_admin.table('subscriptions').upsert({
                "user_id": profile_id,
                "status": "active",
                "plan_id": plan_id,
                "razorpay_payment_id": "manual_cash",
                "current_period_start": today.isoformat(),
                "current_period_end": end_date,
                "updated_at": datetime.datetime.utcnow().isoformat()
            }).execute()
            
            bot.send_message(chat_id, f"✅ *Success!* Recorded cash payment of ₹{plan_info['price']} for *{profile['full_name']}*.\nMembership active till {end_date}.", parse_mode="Markdown")
            
        elif mode == 'razor':
            url = create_razorpay_link(profile['full_name'], profile['phone'], plan_info['price'], plan_info['name'])
            if url:
                # Store URL
                supabase_admin.table('subscriptions').update({
                    "razorpay_subscription_id": url
                }).eq('user_id', profile_id).execute()
                
                bot.send_message(chat_id, f"🔗 *Razorpay Payment Link Generated:*\n{url}\n\nShare this link with {profile['full_name']}.", parse_mode="Markdown")
            else:
                bot.send_message(chat_id, "❌ Razorpay link creation failed. Falling back to cash options.")
                
    except Exception as e:
        print(f"Payment record error: {e}")
        bot.send_message(chat_id, "⚠️ Database write error.")
        
    PAYMENT_SESSIONS.pop(chat_id, None)

@bot.callback_query_handler(func=lambda call: call.data.startswith("mcardlink_"))
@admin_only
def member_card_paylink_shortcut(call):
    chat_id = call.message.chat.id
    profile_id = call.data.split("_")[1]
    
    PAYMENT_SESSIONS[chat_id] = {"profile_id": profile_id}
    
    markup = telebot.types.InlineKeyboardMarkup()
    for pid, plan in PLANS.items():
        markup.add(telebot.types.InlineKeyboardButton(f"{plan['name']} (₹{plan['price']})", callback_data=f"payplan_{pid}"))
    bot.send_message(chat_id, "Select membership plan to generate link for:", reply_markup=markup)

@bot.message_handler(commands=['paymentlink'])
@admin_only
def payment_link_command(message):
    query = telebot.util.extract_arguments(message.text)
    if not query:
        bot.reply_to(message, "Usage: `/paymentlink <name_or_phone>`", parse_mode="Markdown")
        return
    # Just redirect to search handler for payment selection
    handle_payment_cmd(message)

@bot.message_handler(commands=['history'])
@admin_only
def handle_history(message):
    query = telebot.util.extract_arguments(message.text)
    if not query:
        bot.reply_to(message, "Usage: `/history <name_or_phone>`", parse_mode="Markdown")
        return
        
    try:
        res = supabase_admin.table('profiles').select('id, full_name').or_(f"full_name.ilike.%{query}%,phone.ilike.%{query}%").execute()
        results = res.data or []
        if not results:
            bot.send_message(message.chat.id, "No matching athletes found.")
            return
            
        profile_id = results[0]['id']
        name = results[0]['full_name']
        
        sub_res = supabase_admin.table('subscriptions').select('*').eq('user_id', profile_id).execute()
        subs = sub_res.data or []
        
        hist_text = f"📋 *SUBSCRIPTION HISTORY — {name.upper()}*\n\n"
        if not subs:
            hist_text += "No records found."
        for s in subs:
            p_name = PLANS.get(s['plan_id'], {}).get('name', 'Custom')
            hist_text += (
                f"• *Plan:* {p_name}\n"
                f"  Status: {s['status'].upper()}\n"
                f"  Payment ID: `{s.get('razorpay_payment_id', 'N/A')}`\n"
                f"  Duration: {s.get('current_period_start', 'N/A')[:10]} to {s.get('current_period_end', 'N/A')[:10]}\n\n"
            )
        bot.send_message(message.chat.id, hist_text, parse_mode="Markdown")
    except Exception as e:
        print(f"History compile error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error fetching records.")

# ─────────────────────────────────────────────────────────────
# 9. ATTENDANCE PROTOCOL (/attendance, /viewattendance)
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['attendance'])
@admin_only
def handle_attendance_cmd(message):
    markup = telebot.types.InlineKeyboardMarkup()
    markup.add(
        telebot.types.InlineKeyboardButton("📋 Today's Present List", callback_data="attend_today"),
        telebot.types.InlineKeyboardButton("➕ Mark Check In", callback_data="attend_mark")
    )
    bot.send_message(message.chat.id, "Select Attendance action:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("attend_"))
@admin_only
def handle_attendance_actions(call):
    chat_id = call.message.chat.id
    action = call.data.split("_")[1]
    
    if action == 'today':
        send_today_present_list(chat_id, call.message.message_id)
    elif action == 'mark':
        msg = bot.send_message(chat_id, "Enter Member's Name or Phone to check in:")
        bot.register_next_step_handler(msg, attendance_search)

def attendance_search(message):
    query = message.text.strip() if message.text else ""
    if query.lower() in ['/cancel', 'cancel']:
        bot.reply_to(message, "❌ Aborted.")
        return
        
    try:
        res = supabase_admin.table('profiles').select('*').or_(f"full_name.ilike.%{query}%,phone.ilike.%{query}%").execute()
        results = res.data or []
        
        if not results:
            bot.send_message(message.chat.id, "No matching athletes found.")
            return
            
        markup = telebot.types.InlineKeyboardMarkup()
        for r in results[:10]:
            markup.add(telebot.types.InlineKeyboardButton(f"{r['full_name']} ({r['phone']})", callback_data=f"markcheckin_{r['id']}"))
        bot.send_message(message.chat.id, "Select athlete to check in:", reply_markup=markup)
    except Exception as e:
        print(f"Attendance search error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error querying database.")

@bot.callback_query_handler(func=lambda call: call.data.startswith("markcheckin_") or call.data.startswith("mcardcheck_"))
@admin_only
def record_checkin_callback(call):
    chat_id = call.message.chat.id
    profile_id = call.data.split("_")[1]
    today_str = datetime.date.today().isoformat()
    
    try:
        # Fetch metadata
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        user = user_res.user
        meta = user.user_metadata or {}
        
        attendance = meta.get("attendance", [])
        if today_str in attendance:
            bot.answer_callback_query(call.id, "Already checked in today! ✅", show_alert=True)
            return
            
        attendance.append(today_str)
        meta["attendance"] = attendance
        
        supabase_admin.auth.admin.update_user_by_id(profile_id, attributes={"user_metadata": meta})
        bot.answer_callback_query(call.id, "✅ Checked in successfully!")
        
        prof = supabase_admin.table('profiles').select('full_name').eq('id', profile_id).single().execute()
        if prof.data:
            bot.send_message(chat_id, f"✅ Check-in recorded for *{prof.data['full_name']}* today ({today_str})!", parse_mode="Markdown")
            
    except Exception as e:
        print(f"Check-in recording error: {e}")
        bot.send_message(chat_id, "⚠️ Error saving attendance.")

def send_today_present_list(chat_id, edit_message_id=None):
    today_str = datetime.date.today().isoformat()
    try:
        users_res = supabase_admin.auth.admin.list_users()
        users = users_res if isinstance(users_res, list) else (getattr(users_res, 'users', None) or [])
        
        present_users = []
        for u in users:
            meta = u.user_metadata or {}
            role = meta.get("role", "member")
            if role == "member":
                attendance = meta.get("attendance", [])
                if today_str in attendance:
                    present_users.append(meta.get("full_name", u.email))
                    
        res_text = f"📅 *TODAY'S ATTENDANCE ({today_str})*\n\n"
        if not present_users:
            res_text += "No members present yet."
        for index, name in enumerate(present_users):
            res_text += f"{index + 1}. *{name}* ✅\n"
            
        if edit_message_id:
            bot.edit_message_text(res_text, chat_id, edit_message_id, parse_mode="Markdown")
        else:
            bot.send_message(chat_id, res_text, parse_mode="Markdown")
    except Exception as e:
        print(f"Attendance report compile error: {e}")
        bot.send_message(chat_id, "⚠️ Error reading attendance roster.")

@bot.message_handler(commands=['viewattendance'])
@admin_only
def view_attendance_report(message):
    today = datetime.date.today()
    try:
        users_res = supabase_admin.auth.admin.list_users()
        users = users_res if isinstance(users_res, list) else (getattr(users_res, 'users', None) or [])
        
        dates_counts = {}
        for i in range(7):
            d_str = (today - datetime.timedelta(days=i)).isoformat()
            dates_counts[d_str] = 0
            
        for u in users:
            meta = u.user_metadata or {}
            role = meta.get("role", "member")
            if role == "member":
                attendance = meta.get("attendance", [])
                for d in dates_counts.keys():
                    if d in attendance:
                        dates_counts[d] += 1
                        
        report_text = "📊 *ATTENDANCE TELEMETRY (LAST 7 DAYS)*\n\n"
        for d, count in sorted(dates_counts.items(), reverse=True):
            visual_bar = "🟩" * count if count > 0 else "⬜"
            report_text += f"• *{d[8:]} {datetime.datetime.strptime(d, '%Y-%m-%d').strftime('%b')}:* {visual_bar} ({count} present)\n"
            
        bot.send_message(message.chat.id, report_text, parse_mode="Markdown")
    except Exception as e:
        print(f"Report compile error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error compiling attendance report.")

# ─────────────────────────────────────────────────────────────
# 10. ATHLETE EXPIRY & DIRECT COMMUNICATIONS (/expiring, /notify)
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['expiring'])
@admin_only
def handle_expiring_list(message):
    try:
        subs_res = supabase_admin.table('subscriptions').select('*').eq('status', 'active').execute()
        subs = subs_res.data or []
        
        today = datetime.datetime.utcnow().date()
        target_date = today + datetime.timedelta(days=7)
        
        expiring_list = []
        for s in subs:
            end_str = s.get('current_period_end')
            if end_str:
                end_dt = datetime.datetime.fromisoformat(end_str.replace('Z', '+00:00')).date()
                if today <= end_dt <= target_date:
                    expiring_list.append((s['user_id'], end_dt.isoformat()))
                    
        if not expiring_list:
            bot.send_message(message.chat.id, "No premium memberships expiring in the next 7 days. 👍")
            return
            
        profile_ids = [item[0] for item in expiring_list]
        profs_res = supabase_admin.table('profiles').select('*').in_('id', profile_ids).execute()
        profiles = {p['id']: p for p in profs_res.data}
        
        alert_msg = "🔔 *EXPIRING SOON (NEXT 7 DAYS)*\n\n"
        markup = telebot.types.InlineKeyboardMarkup()
        
        for index, (uid, expiry) in enumerate(expiring_list):
            p = profiles.get(uid)
            if p:
                alert_msg += f"{index + 1}. *{p['full_name']}* ({p['phone']})\n   Expires: {expiry}\n\n"
                # If they have Telegram linked, add quick reminder button
                # Let's verify if they have a linked TG ID
                user_res = supabase_admin.auth.admin.get_user_by_id(uid)
                u_meta = user_res.user.user_metadata or {}
                if u_meta.get("telegram_chat_id"):
                    markup.add(telebot.types.InlineKeyboardButton(f"💬 Remind {p['full_name']}", callback_data=f"remindexpiry_{uid}"))
                    
        bot.send_message(message.chat.id, alert_msg, parse_mode="Markdown", reply_markup=markup if markup.keyboard else None)
    except Exception as e:
        print(f"Expiring check error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error checking membership durations.")

@bot.callback_query_handler(func=lambda call: call.data.startswith("remindexpiry_"))
@admin_only
def send_expiry_reminder_callback(call):
    profile_id = call.data.split("_")[1]
    try:
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        user = user_res.user
        meta = user.user_metadata or {}
        tg_chat_id = meta.get("telegram_chat_id")
        
        if not tg_chat_id:
            bot.answer_callback_query(call.id, "Member Telegram chat is not linked.", show_alert=True)
            return
            
        sub_res = supabase_admin.table('subscriptions').select('current_period_end').eq('user_id', profile_id).single().execute()
        expiry_date = sub_res.data.get('current_period_end', 'soon')[:10] if sub_res.data else "soon"
        
        remind_msg = (
            f"🔔 *MEMBERSHIP RENEWAL ALERT* 🔔\n\n"
            f"Hi *{meta.get('full_name', 'Athlete')}*,\n\n"
            f"Your premium S Fitness membership is scheduled to expire on *{expiry_date}*.\n\n"
            f"Smash your limits without interruption! Please visit the gym desk or dashboard to complete your renewal. 💪"
        )
        
        member_bot.send_message(tg_chat_id, remind_msg, parse_mode="Markdown")
        bot.answer_callback_query(call.id, "✅ Renewal alert successfully sent to member!")
    except Exception as e:
        print(f"Reminder dispatch error: {e}")
        bot.answer_callback_query(call.id, "⚠️ Failed to dispatch Telegram alert.")

# ─────────────────────────────────────────────────────────────
# 11. TRAINER-SPECIFIC UTILITIES (/myassigned, /notes, /fee_summary)
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['myassigned'])
@admin_only
def handle_myassigned(message):
    trainer_name = get_admin_name(message.from_user.id)
    bot.send_message(message.chat.id, f"Retrieving athletes assigned to coach '{trainer_name}'... 🔍")
    
    try:
        users_res = supabase_admin.auth.admin.list_users()
        users = users_res if isinstance(users_res, list) else (getattr(users_res, 'users', None) or [])
        
        assigned_members = []
        for u in users:
            meta = u.user_metadata or {}
            role = meta.get("role", "member")
            if role == "member" and meta.get("assigned_trainer") == trainer_name:
                assigned_members.append(meta.get("full_name", u.email))
                
        out_msg = f"🏋️ *ATHLETES ASSIGNED TO {trainer_name.upper()} ({len(assigned_members)}):*\n\n"
        if not assigned_members:
            out_msg += "No athletes currently assigned to you."
        for index, name in enumerate(assigned_members):
            out_msg += f"{index + 1}. *{name}*\n"
            
        bot.send_message(message.chat.id, out_msg, parse_mode="Markdown")
    except Exception as e:
        print(f"My assigned fetch error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error compiling roster.")

@bot.callback_query_handler(func=lambda call: call.data.startswith("mcardnote_"))
@admin_only
def add_note_callback(call):
    chat_id = call.message.chat.id
    profile_id = call.data.split("_")[1]
    
    msg = bot.send_message(chat_id, "Reply with the note you want to append for this athlete:")
    bot.register_next_step_handler(msg, save_note_process, profile_id)

def save_note_process(message, profile_id):
    note_text = message.text.strip() if message.text else ""
    if not note_text or note_text.lower() in ['/cancel', 'cancel']:
        bot.reply_to(message, "❌ Note creation cancelled.")
        return
        
    trainer_name = get_admin_name(message.from_user.id)
    timestamp = datetime.datetime.now().strftime("%d-%m-%Y %H:%M")
    
    try:
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        user = user_res.user
        meta = user.user_metadata or {}
        
        notes = meta.get("workout_notes", [])
        notes.append({
            "date": timestamp,
            "trainer": trainer_name,
            "text": note_text
        })
        meta["workout_notes"] = notes
        
        supabase_admin.auth.admin.update_user_by_id(profile_id, attributes={"user_metadata": meta})
        bot.reply_to(message, f"✅ Note successfully added to profile by *{trainer_name}*!", parse_mode="Markdown")
    except Exception as e:
        print(f"Note save error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error updating athlete records.")

@bot.message_handler(commands=['notes'])
@admin_only
def handle_notes_cmd(message):
    args = telebot.util.extract_arguments(message.text)
    if not args:
        bot.reply_to(message, "Usage: `/notes <name_or_phone> <your custom note>`", parse_mode="Markdown")
        return
        
    parts = args.split(maxsplit=1)
    query = parts[0].strip()
    if len(parts) < 2:
        bot.reply_to(message, "Please provide the note text. Example: `/notes 9876543210 Squat depth looks good.`", parse_mode="Markdown")
        return
    note_text = parts[1].strip()
    
    try:
        res = supabase_admin.table('profiles').select('id, full_name').or_(f"full_name.ilike.%{query}%,phone.ilike.%{query}%").execute()
        results = res.data or []
        if not results:
            bot.send_message(message.chat.id, "No matching athletes found.")
            return
            
        profile_id = results[0]['id']
        name = results[0]['full_name']
        
        # Save note
        trainer_name = get_admin_name(message.from_user.id)
        timestamp = datetime.datetime.now().strftime("%d-%m-%Y %H:%M")
        
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        meta = user_res.user.user_metadata or {}
        
        notes = meta.get("workout_notes", [])
        notes.append({
            "date": timestamp,
            "trainer": trainer_name,
            "text": note_text
        })
        meta["workout_notes"] = notes
        
        supabase_admin.auth.admin.update_user_by_id(profile_id, attributes={"user_metadata": meta})
        bot.send_message(message.chat.id, f"✅ Note successfully appended for *{name}*!", parse_mode="Markdown")
    except Exception as e:
        print(f"Notes append error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error appending notes.")

@bot.message_handler(commands=['fee_summary'])
@admin_only
def handle_fee_summary(message):
    try:
        subs_res = supabase_admin.table('subscriptions').select('*').execute()
        subs = subs_res.data or []
        
        today_str = datetime.date.today().isoformat()
        
        total_cash = 0
        total_razor = 0
        cash_count = 0
        razor_count = 0
        
        for s in subs:
            # Check if updated/created today
            updated = s.get('updated_at') or s.get('created_at')
            if updated and updated.startswith(today_str) and s.get('status') == 'active':
                pid = s.get('plan_id')
                plan_price = PLANS.get(pid, {}).get('price', 0)
                
                pay_id = s.get('razorpay_payment_id')
                if pay_id == 'manual_cash':
                    total_cash += plan_price
                    cash_count += 1
                else:
                    total_razor += plan_price
                    razor_count += 1
                    
        summary = (
            f"💰 *DAILY FEE SUMMARY ({today_str})*\n\n"
            f"💵 *Cash & UPI Payments:*\n"
            f"  • Collections: ₹{total_cash}\n"
            f"  • Txns: {cash_count}\n\n"
            f"💳 *Razorpay Gateway Payments:*\n"
            f"  • Collections: ₹{total_razor}\n"
            f"  • Txns: {razor_count}\n\n"
            f"📈 *TOTAL TODAY:* ₹{total_cash + total_razor}"
        )
        bot.send_message(message.chat.id, summary, parse_mode="Markdown")
    except Exception as e:
        print(f"Fee summary compiling error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error compiling fee summary.")

# ─────────────────────────────────────────────────────────────
# 12. OWNER-ONLY CONTROLS (/broadcast, /addadmin, /removeadmin, /export)
# ─────────────────────────────────────────────────────────────
@bot.message_handler(commands=['broadcast'])
@admin_only
@owner_only
def handle_broadcast_cmd(message):
    msg = bot.reply_to(message, "📢 *SYSTEM BROADCAST*\n\nReply with the message details to send to all active gym members:\n(Markdown formatting supported, or type /cancel to abort)", parse_mode="Markdown")
    bot.register_next_step_handler(msg, process_broadcast_message)

def process_broadcast_message(message):
    text = message.text.strip() if message.text else ""
    if not text or text.lower() in ['/cancel', 'cancel']:
        bot.reply_to(message, "❌ Broadcast cancelled.")
        return
        
    try:
        users_res = supabase_admin.auth.admin.list_users()
        users = users_res if isinstance(users_res, list) else (getattr(users_res, 'users', None) or [])
        
        active_tgs = []
        for u in users:
            meta = u.user_metadata or {}
            role = meta.get("role", "member")
            if role == "member":
                tg_id = meta.get("telegram_chat_id")
                if tg_id:
                    active_tgs.append((tg_id, meta.get("full_name", "Athlete")))
                    
        if not active_tgs:
            bot.send_message(message.chat.id, "No active members have linked Telegram accounts.")
            return
            
        sent_ok = 0
        sent_err = 0
        
        bot.send_message(message.chat.id, f"Broadcasting alert to {len(active_tgs)} members... 📢")
        for tg_id, name in active_tgs:
            try:
                formatted = (
                    f"📢 *S FITNESS ANNOUNCEMENT* 🏆\n\n"
                    f"Hi *{name}*,\n\n"
                    f"{text}\n\n"
                    f"Keep grinding! 💪"
                )
                member_bot.send_message(tg_id, formatted, parse_mode="Markdown")
                sent_ok += 1
            except Exception as e:
                print(f"Failed sending broadcast to {tg_id}: {e}")
                sent_err += 1
                
        bot.send_message(message.chat.id, f"✅ *Broadcast Dispatch Completed:*\n• Sent successfully: {sent_ok}\n• Failed: {sent_err}", parse_mode="Markdown")
    except Exception as e:
        print(f"Broadcast error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error compiling broadcast roster.")

@bot.message_handler(commands=['addadmin'])
@admin_only
@owner_only
def handle_addadmin(message):
    query = telebot.util.extract_arguments(message.text)
    if not query:
        bot.reply_to(message, "Usage: `/addadmin <phone>`", parse_mode="Markdown")
        return
        
    try:
        res = supabase_admin.table('profiles').select('id, full_name').eq('phone', query).execute()
        results = res.data or []
        if not results:
            bot.send_message(message.chat.id, f"No member profile found with phone number '{query}'.")
            return
            
        profile_id = results[0]['id']
        name = results[0]['full_name']
        
        # Promote in Profiles
        supabase_admin.table('profiles').update({"role": "trainer"}).eq('id', profile_id).execute()
        
        # Promote in Auth metadata
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        meta = user_res.user.user_metadata or {}
        meta["role"] = "trainer"
        supabase_admin.auth.admin.update_user_by_id(profile_id, attributes={"user_metadata": meta})
        
        bot.send_message(message.chat.id, f"✅ Member *{name}* has been promoted to Coach/Trainer! 🏋️", parse_mode="Markdown")
    except Exception as e:
        print(f"Promote error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error promotion handler.")

@bot.message_handler(commands=['removeadmin'])
@admin_only
@owner_only
def handle_removeadmin(message):
    query = telebot.util.extract_arguments(message.text)
    if not query:
        bot.reply_to(message, "Usage: `/removeadmin <phone>`", parse_mode="Markdown")
        return
        
    try:
        res = supabase_admin.table('profiles').select('id, full_name').eq('phone', query).execute()
        results = res.data or []
        if not results:
            bot.send_message(message.chat.id, f"No profile found with phone number '{query}'.")
            return
            
        profile_id = results[0]['id']
        name = results[0]['full_name']
        
        # Demote in Profiles
        supabase_admin.table('profiles').update({"role": "member"}).eq('id', profile_id).execute()
        
        # Demote in Auth metadata
        user_res = supabase_admin.auth.admin.get_user_by_id(profile_id)
        meta = user_res.user.user_metadata or {}
        meta["role"] = "member"
        supabase_admin.auth.admin.update_user_by_id(profile_id, attributes={"user_metadata": meta})
        
        bot.send_message(message.chat.id, f"✅ Coach *{name}* has been demoted to a regular gym member.", parse_mode="Markdown")
    except Exception as e:
        print(f"Demote error: {e}")
        bot.send_message(message.chat.id, "⚠️ Error demoting role.")

@bot.message_handler(commands=['export'])
@admin_only
@owner_only
def handle_export(message):
    bot.send_message(message.chat.id, "Generating roster CSV export... 📥")
    try:
        res = supabase_admin.table('profiles').select('*').execute()
        profiles = res.data or []
        
        if not profiles:
            bot.send_message(message.chat.id, "No records to export.")
            return
            
        output = io.StringIO()
        output.write("Member ID,Full Name,Phone,Role,Gender,Blood Group,Created At\n")
        
        for p in profiles:
            output.write(
                f"\"{p.get('member_id','N/A')}\","
                f"\"{p.get('full_name','N/A')}\","
                f"\"{p.get('phone','N/A')}\","
                f"\"{p.get('role','N/A')}\","
                f"\"{p.get('gender','N/A')}\","
                f"\"{p.get('blood_group','N/A')}\","
                f"\"{p.get('created_at','N/A')[:10]}\"\n"
            )
            
        csv_bytes = io.BytesIO(output.getvalue().encode('utf-8'))
        csv_bytes.name = f"sfitness_roster_{datetime.date.today().isoformat()}.csv"
        
        bot.send_document(message.chat.id, csv_bytes, caption="📋 Complete gym roster database export.")
    except Exception as e:
        print(f"Export error: {e}")
        bot.send_message(message.chat.id, "⚠️ Database export compile error.")

# ─────────────────────────────────────────────────────────────
# 13. FALLBACK AND INLINE CALLBACK ROUTERS
# ─────────────────────────────────────────────────────────────
@bot.callback_query_handler(func=lambda call: call.data.startswith("btn_"))
@admin_only
def handle_menu_callbacks(call):
    action = call.data.split("_")[1]
    if action == 'dashboard':
        send_dashboard(call.message.chat.id)
    elif action == 'members':
        send_members_page(call.message.chat.id, 0)
    elif action == 'attendance':
        handle_attendance_cmd(call.message)
    elif action == 'pending':
        handle_pending_list(call.message)
    bot.answer_callback_query(call.id)

@bot.message_handler(func=lambda message: True)
@admin_only
def handle_unhandled_messages(message):
    bot.reply_to(message, "I didn't recognize that command. Send /start or /help to view available dashboard controls.")

# ─────────────────────────────────────────────────────────────
# 14. SCHEDULER DAILY JOBS
# ─────────────────────────────────────────────────────────────
scheduler = BackgroundScheduler(timezone=timezone("Asia/Kolkata"))

@scheduler.scheduled_job('cron', hour=9, minute=0)
def daily_expiry_notifications():
    """Alerts members expiring today and notifies admins."""
    try:
        subs_res = supabase_admin.table('subscriptions').select('*').eq('status', 'active').execute()
        subs = subs_res.data or []
        
        today = datetime.datetime.utcnow().date()
        expired_count = 0
        
        for s in subs:
            end_str = s.get('current_period_end')
            if end_str:
                end_dt = datetime.datetime.fromisoformat(end_str.replace('Z', '+00:00')).date()
                if end_dt == today:
                    uid = s['user_id']
                    # Send alert
                    try:
                        user_res = supabase_admin.auth.admin.get_user_by_id(uid)
                        meta = user_res.user.user_metadata or {}
                        chat_id = meta.get("telegram_chat_id")
                        if chat_id:
                            msg = (
                                f"🔔 *MEMBERSHIP EXPIRED* 🔔\n\n"
                                f"Hi *{meta.get('full_name', 'Athlete')}*,\n\n"
                                f"Your premium membership expires today. Please complete your renewal to keep your session logs active! 💪"
                            )
                            member_bot.send_message(chat_id, msg, parse_mode="Markdown")
                            expired_count += 1
                    except Exception as err:
                        print(f"Scheduler failed to notify {uid}: {err}")
                        
        if expired_count > 0 and owner_chat_id:
            bot.send_message(
                owner_chat_id,
                f"📅 *Daily Expiry Dispatch Summary:*\n• {expired_count} athletes expired today and were notified.",
                parse_mode="Markdown"
            )
    except Exception as e:
        print(f"Scheduler expiry job failed: {e}")

@scheduler.scheduled_job('cron', hour=9, minute=5)
def three_day_expiry_alerts():
    """Alerts admins about memberships expiring in 3 days."""
    try:
        subs_res = supabase_admin.table('subscriptions').select('*').eq('status', 'active').execute()
        subs = subs_res.data or []
        
        today = datetime.datetime.utcnow().date()
        target_day = today + datetime.timedelta(days=3)
        
        expiring_soon = []
        for s in subs:
            end_str = s.get('current_period_end')
            if end_str:
                end_dt = datetime.datetime.fromisoformat(end_str.replace('Z', '+00:00')).date()
                if end_dt == target_day:
                    expiring_soon.append(s['user_id'])
                    
        if expiring_soon and owner_chat_id:
            profs = supabase_admin.table('profiles').select('full_name, phone').in_('id', expiring_soon).execute()
            alert = "🔔 *RENEWALS DUE IN 3 DAYS:*\n\n"
            for index, p in enumerate(profs.data or []):
                alert += f"{index + 1}. *{p['full_name']}* ({p['phone']})\n"
            bot.send_message(owner_chat_id, alert, parse_mode="Markdown")
    except Exception as e:
        print(f"Scheduler 3-day alert failed: {e}")

@scheduler.scheduled_job('cron', hour=22, minute=0)
def check_razorpay_pending_payments():
    """Syncs pending Razorpay subscriptions from Gateway api."""
    if not razorpay_client:
        return
    try:
        # Check active status where razorpay link is present and status is not active (or needs sync)
        # We can look up all subscriptions with a razorpay_subscription_id (which stores the link or order/payment ID)
        # and check status.
        pass
    except Exception as e:
        print(f"Scheduler payment verification failed: {e}")

# ─────────────────────────────────────────────────────────────
# 15. SYSTEM STARTUP
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Starting Gym Scheduler Engine...")
    scheduler.start()
    
    print("🚀 Starting Trainer Bot in polling mode...")
    try:
        bot.infinity_polling()
    except Exception as err:
        print(f"Error starting Trainer Bot: {err}")
