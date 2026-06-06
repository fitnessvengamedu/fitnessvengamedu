# 🏋️ GYM MANAGER TELEGRAM BOT — PROJECT PRD
**Version:** 1.0.0  
**Target AI Agent:** Claude Code / Any LLM Coding Agent  
**Stack:** Python · python-telegram-bot · Supabase · Razorpay  
**Purpose:** Complete gym management via Telegram — members, payments, attendance, reports

---

## 1. PROJECT OVERVIEW

Build a **production-grade Telegram bot** for gym owners and trainers to:
- Track member registrations and status
- Record and monitor payment/fees
- Generate Razorpay payment links
- View live dashboard stats
- Mark and view attendance
- Send alerts for expiring/unpaid members

**Admin-only access** — only registered admins (gym owner + trainers) can use bot commands. Regular members receive only payment/reminder messages.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Language | Python 3.11+ |
| Telegram Framework | `python-telegram-bot==21.x` (async) |
| Database | Supabase (PostgreSQL via REST + `supabase-py`) |
| Payments | Razorpay Python SDK |
| Scheduler | `APScheduler` (for daily reminders) |
| Environment | `python-dotenv` |
| Deployment | Systemd on Linux (EC2 or local server) |

---

## 3. ENVIRONMENT VARIABLES

Create `.env` file in project root:

```env
# Telegram
BOT_TOKEN=your_telegram_bot_token

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Bot Config
ADMIN_TELEGRAM_IDS=123456789,987654321
GYM_NAME=My Fitness Gym
CURRENCY=INR
TIMEZONE=Asia/Kolkata
```

---

## 4. SUPABASE DATABASE SCHEMA

Run all SQL in Supabase SQL Editor in this exact order.

### 4.1 — `admins` table
```sql
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'trainer')) DEFAULT 'trainer',
  phone TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### 4.2 — `membership_plans` table
```sql
CREATE TABLE membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default plans
INSERT INTO membership_plans (name, duration_months, price, description) VALUES
  ('Monthly', 1, 600.00, 'Standard 1-month membership'),
  ('Quarterly', 3, 1600.00, '3-month discounted membership'),
  ('Half Yearly', 6, 3000.00, '6-month membership'),
  ('Annual', 12, 5500.00, 'Full year membership');
```

### 4.3 — `members` table
```sql
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  plan_id UUID REFERENCES membership_plans(id),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_start DATE,
  membership_end DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'expired', 'suspended')) DEFAULT 'active',
  emergency_contact TEXT,
  profile_photo_url TEXT,
  notes TEXT,
  added_by BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4 — `payments` table
```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES membership_plans(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'razorpay', 'upi', 'bank_transfer', 'other')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_payment_link TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  period_start DATE,
  period_end DATE,
  notes TEXT,
  collected_by BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 — `attendance` table
```sql
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  marked_by BIGINT,
  UNIQUE(member_id, date)
);
```

### 4.6 — `notifications_log` table
```sql
CREATE TABLE notifications_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('payment_reminder', 'expiry_alert', 'welcome', 'payment_received', 'broadcast')),
  message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);
```

### 4.7 — Useful Views
```sql
-- Active members count
CREATE VIEW v_dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active') AS active_members,
  COUNT(*) FILTER (WHERE join_date >= date_trunc('month', CURRENT_DATE)) AS new_this_month,
  COUNT(*) AS total_members,
  COUNT(*) FILTER (WHERE status = 'expired' OR membership_end < CURRENT_DATE) AS expired_members
FROM members;

-- Members with pending payments (membership_end passed, no paid payment in last 30 days)
CREATE VIEW v_pending_fees AS
SELECT
  m.id, m.name, m.phone, m.telegram_id,
  m.membership_end,
  mp.price AS plan_price, mp.name AS plan_name
FROM members m
LEFT JOIN membership_plans mp ON m.plan_id = mp.id
WHERE m.membership_end < CURRENT_DATE
  AND m.status != 'inactive'
ORDER BY m.membership_end ASC;
```

---

## 5. PROJECT FILE STRUCTURE

```
gym-bot/
├── .env
├── main.py                  # Entry point
├── config.py                # Load env vars
├── database.py              # Supabase client + all DB functions
├── razorpay_utils.py        # Razorpay order + payment link creation
├── scheduler.py             # APScheduler daily jobs
├── handlers/
│   ├── __init__.py
│   ├── auth.py              # Admin check decorator
│   ├── start.py             # /start command
│   ├── dashboard.py         # /dashboard command
│   ├── members.py           # Add/edit/list/search members
│   ├── payments.py          # Record payment, view history
│   ├── attendance.py        # Mark + view attendance
│   ├── reports.py           # Monthly/weekly reports
│   ├── plans.py             # Manage membership plans
│   ├── broadcast.py         # Broadcast messages
│   └── callbacks.py         # Inline keyboard callbacks
├── keyboards.py             # All InlineKeyboardMarkup builders
├── messages.py              # All message templates
└── requirements.txt
```

---

## 6. REQUIREMENTS.TXT

```
python-telegram-bot==21.6
supabase==2.4.0
razorpay==1.4.1
python-dotenv==1.0.0
APScheduler==3.10.4
pytz==2024.1
aiohttp==3.9.3
```

---

## 7. BOT COMMANDS LIST

Register these with @BotFather via `/setcommands`:

```
start - Welcome & main menu
dashboard - Live gym stats overview
addmember - Register new gym member
members - List all active members
search - Search member by name/phone
pending - Members with pending fees
payment - Record a payment
paymentlink - Generate Razorpay payment link
history - Payment history for a member
attendance - Mark today's attendance
viewattendance - View attendance report
expiring - Members expiring in 7 days
report - Monthly summary report
plans - View/manage membership plans
addadmin - Add trainer or admin
broadcast - Send message to all members
help - Show all commands
```

---

## 8. COMMAND IMPLEMENTATIONS

### 8.1 — `config.py`
```python
import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
GYM_NAME = os.getenv("GYM_NAME", "Gym Manager")
CURRENCY = os.getenv("CURRENCY", "INR")
TIMEZONE = os.getenv("TIMEZONE", "Asia/Kolkata")
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_TELEGRAM_IDS", "").split(",") if x.strip()]
```

### 8.2 — `handlers/auth.py`
```python
from functools import wraps
from telegram import Update
from telegram.ext import ContextTypes
from database import is_admin

def admin_only(func):
    @wraps(func)
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
        user_id = update.effective_user.id
        if not await is_admin(user_id):
            await update.message.reply_text("⛔ Access denied. Admins only.")
            return
        return await func(update, context, *args, **kwargs)
    return wrapper
```

### 8.3 — `handlers/dashboard.py`
```python
# /dashboard command
# Query v_dashboard_stats view from Supabase
# Also query:
#   - Total revenue this month (SUM of payments WHERE payment_status='paid' AND payment_date >= start of month)
#   - Count of pending fee members (from v_pending_fees)
#   - Members expiring in 7 days
# Format as emoji-rich dashboard message with InlineKeyboard for quick actions
```

**Dashboard message format:**
```
🏋️ GYM NAME — Live Dashboard

👥 Members
  ✅ Active: 45
  🆕 New This Month: 8
  📊 Total Registered: 120
  ❌ Expired: 12

💰 Payments
  ✅ Collected This Month: ₹28,400
  ⚠️ Pending Fees: 7 members
  📅 Expiring in 7 days: 5 members

📆 Today: 06 June 2026
🕒 Last Updated: 10:30 AM

[👥 Members] [💰 Payments] [📋 Reports]
```

### 8.4 — `handlers/members.py`

**`/addmember` — Conversation Handler flow:**
```
Step 1: Ask full name
Step 2: Ask phone number (validate 10-digit Indian)
Step 3: Ask email (optional, skip with -)
Step 4: Ask gender (InlineKeyboard: Male / Female / Other)
Step 5: Show membership plans as InlineKeyboard (from DB)
Step 6: Ask membership start date (default today)
Step 7: Confirm — show summary + [✅ Confirm] [❌ Cancel] buttons
Step 8: INSERT into members table, set membership_end = start + plan.duration_months
Step 9: Auto-create first payment record as 'pending'
Step 10: Ask if send payment link via Razorpay? [Yes] [No, cash]
```

**`/members` — List active members:**
- Paginated (10 per page)
- Show: Name, Phone, Plan, Expiry date, Status emoji
- InlineKeyboard: [Next Page] [View Member]

**`/search` — Search member:**
- Ask for name or phone
- Fuzzy search on `name` using `ilike %query%` OR exact `phone` match
- Show member card with full details + action buttons: [💰 Pay] [📋 History] [✏️ Edit] [❌ Remove]

**Member Card format:**
```
👤 MEMBER DETAILS
━━━━━━━━━━━━━━━━━
🆔 ID: #0042
👤 Name: Rajesh Kumar
📱 Phone: 9876543210
📧 Email: raj@example.com
🗓️ Joined: 01 Jan 2026
📋 Plan: Monthly (₹600)
📅 Valid Till: 31 Jan 2026
⚠️ Status: EXPIRED

[💰 Record Payment] [📋 Pay History]
[✏️ Edit Member] [🗑️ Delete]
```

### 8.5 — `handlers/payments.py`

**`/pending` — Members with unpaid fees:**
- Query `v_pending_fees` view
- Show list: Name | Phone | Plan | Expired since X days
- Each member row has [💰 Pay Now] button
- [📤 Send All Reminders] button at bottom

**`/payment` — Record payment flow:**
```
Step 1: Ask member name/phone to search
Step 2: Select member from results
Step 3: Show current plan price, ask amount (pre-fill plan price)
Step 4: Ask payment method: [💵 Cash] [📱 UPI] [💳 Razorpay] [🏦 Bank]
Step 5: If Razorpay → create order, generate payment link, send to admin + member
Step 6: If Cash/UPI → record directly as 'paid'
Step 7: Update member.membership_end = MAX(today, old_end) + plan.duration_months
Step 8: Send confirmation to admin + member (if has telegram_id)
```

**`/paymentlink` — Generate Razorpay link:**
```
Step 1: Search member
Step 2: Select plan/amount
Step 3: Call Razorpay Payment Links API
Step 4: Send link to admin
Step 5: Option to forward link to member's Telegram
```

**`/history` — Payment history:**
```
Search member → Show all payments:
Date | Amount | Method | Status | Period
```

### 8.6 — `handlers/attendance.py`

**`/attendance` — Mark attendance:**
- Show list of today's already-marked members
- [+ Mark New] button → search member → confirm → INSERT attendance
- Bulk mark: [📋 Show All Members] → checkboxes via inline keyboard

**`/viewattendance` — Attendance report:**
- Choose: [Today] [This Week] [This Month] [Custom Member]
- Show attendance count per day (bar-style text chart)
- Member-specific: calendar view (text-based) of present/absent days

### 8.7 — `handlers/reports.py`

**`/report` — Monthly summary:**
```
📊 MONTHLY REPORT — JUNE 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 New Members: 8
💰 Revenue Collected: ₹28,400
❌ Pending Fees: 7 members (₹4,200 due)
📅 Memberships Expired: 12
🏃 Avg Daily Attendance: 23

Top Plans Sold:
  1. Monthly × 5 = ₹3,000
  2. Quarterly × 2 = ₹3,200

[📥 Export CSV] [📤 Send to Owner]
```

### 8.8 — `handlers/plans.py`

**`/plans` — Manage plans:**
- List all plans with price + duration
- [➕ Add Plan] [✏️ Edit] [🗑️ Delete] buttons
- Add plan: Name → Duration (months) → Price → Confirm

### 8.9 — `handlers/broadcast.py`

**`/broadcast` — Send message to all active members:**
- Only owner role can use
- Ask message text (supports formatting)
- Confirm: "Send to X members? [✅ Yes] [❌ Cancel]"
- Loop through members with telegram_id, send message
- Show delivery report: X sent, Y failed

---

## 9. RAZORPAY INTEGRATION (`razorpay_utils.py`)

```python
import razorpay
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, GYM_NAME, CURRENCY

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

async def create_payment_link(member_name: str, phone: str, amount: float, description: str) -> dict:
    """
    Create Razorpay Payment Link
    Returns: { short_url, id, amount, status }
    """
    data = {
        "amount": int(amount * 100),  # paise
        "currency": CURRENCY,
        "accept_partial": False,
        "description": description,
        "customer": {
            "name": member_name,
            "contact": f"+91{phone}"
        },
        "notify": {
            "sms": True,
            "email": False
        },
        "reminder_enable": True,
        "notes": {
            "gym": GYM_NAME
        },
        "callback_url": "",  # Optional webhook
        "callback_method": "get"
    }
    response = client.payment_link.create(data)
    return {
        "short_url": response["short_url"],
        "id": response["id"],
        "amount": amount,
        "status": response["status"]
    }

async def verify_payment(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """Verify payment signature"""
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })
        return True
    except Exception:
        return False

async def get_payment_status(payment_link_id: str) -> str:
    """Check if Razorpay payment link was paid"""
    response = client.payment_link.fetch(payment_link_id)
    return response["status"]  # paid / created / expired
```

---

## 10. SCHEDULER — AUTO JOBS (`scheduler.py`)

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from pytz import timezone

scheduler = AsyncIOScheduler(timezone=timezone("Asia/Kolkata"))

# Jobs to register:

# Job 1: Daily 9 AM — send payment reminders to members expiring today
@scheduler.scheduled_job('cron', hour=9, minute=0)
async def daily_expiry_reminder():
    # Query members WHERE membership_end = TODAY
    # Send Telegram message to each (if has telegram_id)
    # Send summary to all admins
    pass

# Job 2: Daily 9 AM — alert admins about members expiring in 3 days
@scheduler.scheduled_job('cron', hour=9, minute=5)
async def three_day_expiry_alert():
    pass

# Job 3: 1st of every month — monthly summary to owner
@scheduler.scheduled_job('cron', day=1, hour=8, minute=0)
async def monthly_report_job():
    pass

# Job 4: Daily 10 PM — check Razorpay pending payment links
@scheduler.scheduled_job('cron', hour=22, minute=0)
async def check_razorpay_pending():
    # Fetch all payments WHERE payment_status='pending' AND payment_method='razorpay'
    # Check each razorpay_order_id status
    # If paid → update payment record, update membership_end
    pass
```

---

## 11. DATABASE FUNCTIONS (`database.py`)

Implement all these async functions:

```python
# Admin
async def is_admin(telegram_id: int) -> bool
async def get_admin_role(telegram_id: int) -> str  # 'owner' or 'trainer'
async def add_admin(telegram_id: int, name: str, role: str) -> dict

# Members
async def add_member(data: dict) -> dict
async def get_member_by_phone(phone: str) -> dict | None
async def get_member_by_telegram(telegram_id: int) -> dict | None
async def search_members(query: str) -> list[dict]
async def get_all_active_members() -> list[dict]
async def update_member(member_id: str, data: dict) -> dict
async def delete_member(member_id: str) -> bool
async def get_members_expiring_in_days(days: int) -> list[dict]

# Dashboard stats
async def get_dashboard_stats() -> dict
  # Returns: active_count, new_this_month, total, expired, revenue_this_month, pending_count

# Payments
async def record_payment(data: dict) -> dict
async def get_pending_members() -> list[dict]
async def get_payment_history(member_id: str) -> list[dict]
async def update_payment_status(payment_id: str, status: str, razorpay_payment_id: str = None) -> dict
async def get_monthly_revenue(year: int, month: int) -> float

# Attendance
async def mark_attendance(member_id: str, marked_by: int) -> dict | None
async def get_today_attendance() -> list[dict]
async def get_member_attendance(member_id: str, month: int, year: int) -> list[dict]

# Plans
async def get_all_plans() -> list[dict]
async def get_plan_by_id(plan_id: str) -> dict
async def add_plan(data: dict) -> dict
async def update_plan(plan_id: str, data: dict) -> dict

# Notifications
async def log_notification(member_id: str, type: str, message: str)
```

---

## 12. `main.py` — APPLICATION ENTRY POINT

```python
import asyncio
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ConversationHandler

from config import BOT_TOKEN
from scheduler import scheduler
from handlers.start import start_handler
from handlers.dashboard import dashboard_handler
from handlers.members import addmember_conv, members_handler, search_handler
from handlers.payments import payment_conv, pending_handler, paymentlink_conv, history_handler
from handlers.attendance import attendance_conv, viewattendance_handler
from handlers.reports import report_handler
from handlers.plans import plans_handler
from handlers.broadcast import broadcast_conv
from handlers.callbacks import button_callback

def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Commands
    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(CommandHandler("dashboard", dashboard_handler))
    app.add_handler(CommandHandler("members", members_handler))
    app.add_handler(CommandHandler("search", search_handler))
    app.add_handler(CommandHandler("pending", pending_handler))
    app.add_handler(CommandHandler("history", history_handler))
    app.add_handler(CommandHandler("report", report_handler))
    app.add_handler(CommandHandler("plans", plans_handler))
    app.add_handler(CommandHandler("viewattendance", viewattendance_handler))
    app.add_handler(CommandHandler("expiring", expiring_handler))
    app.add_handler(CommandHandler("help", help_handler))
    
    # Conversation handlers
    app.add_handler(addmember_conv)
    app.add_handler(payment_conv)
    app.add_handler(paymentlink_conv)
    app.add_handler(attendance_conv)
    app.add_handler(broadcast_conv)
    
    # Inline button callbacks
    app.add_handler(CallbackQueryHandler(button_callback))
    
    # Start scheduler
    scheduler.start()
    
    print(f"🏋️ Gym Bot started!")
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
```

---

## 13. ADDITIONAL TRAINER-SPECIFIC FEATURES

### 13.1 — `/myassigned` (Trainer only)
- Show only members assigned to that trainer
- Trainers can only view/manage their own members
- Owner sees all members

### 13.2 — `/notes` — Add member notes
- Record workout notes, health issues, progress notes per member
- Stored in `members.notes` field

### 13.3 — `/expiring` — Quick expiry alerts
- Show members expiring in next 7 days with [💬 Remind] button per row
- Trainer sends personalized reminder in one click

### 13.4 — `/fee_summary` — Daily fee collection
- Show what was collected today (cash vs Razorpay)
- Running total for the day

### 13.5 — Owner-Only Features
- `/broadcast` — Message all members
- `/addadmin` — Add new trainer
- `/removeadmin` — Remove trainer
- `/export` — Export member list as CSV text

---

## 14. SECURITY RULES

1. **Every handler** must use `@admin_only` decorator
2. **Trainer role** cannot: broadcast, add/remove admins, delete members, export data
3. **Owner role** has full access
4. Admin IDs are seeded both in `.env` AND in `admins` table (double-check both)
5. All Supabase queries use **service key** (not anon key) for full access
6. Payment link creation logs must be kept — never delete payment records

---

## 15. ERROR HANDLING RULES

- All DB calls inside `try/except` — on failure, reply "⚠️ Database error. Try again."
- Razorpay calls inside `try/except` — on failure, offer cash payment fallback
- If member has no `telegram_id`, skip Telegram notification silently
- Conversation timeout: 5 minutes — auto-cancel and notify user
- Unknown callback data: reply "⚠️ Session expired. Use /start"

---

## 16. SYSTEMD SERVICE FILE

```ini
# /etc/systemd/system/gymbot.service
[Unit]
Description=Gym Manager Telegram Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/gym-bot
EnvironmentFile=/home/ubuntu/gym-bot/.env
ExecStart=/home/ubuntu/gym-bot/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable gymbot
sudo systemctl start gymbot
sudo systemctl status gymbot
```

---

## 17. SETUP INSTRUCTIONS FOR AGENT

Follow these steps in order:

1. `mkdir gym-bot && cd gym-bot`
2. `python3 -m venv venv && source venv/bin/activate`
3. Create `requirements.txt` from Section 6, then `pip install -r requirements.txt`
4. Create `.env` from Section 3 (fill in real credentials)
5. Run Supabase SQL from Section 4 (all tables + views)
6. Create all files from Section 5 file structure
7. Implement `config.py` → `database.py` → `razorpay_utils.py` → all handlers
8. Implement `main.py` last, after all handlers are ready
9. Run `python main.py` and test each command
10. Deploy via systemd (Section 16)

**Agent must implement all database functions in `database.py` FIRST before any handler.**

---

## 18. TESTING CHECKLIST

- [ ] `/start` shows welcome + main menu
- [ ] Non-admin gets access denied
- [ ] `/addmember` full conversation flow works
- [ ] `/dashboard` shows correct live stats
- [ ] `/pending` shows members with overdue fees
- [ ] `/payment cash` records payment and updates membership_end
- [ ] `/paymentlink` generates valid Razorpay URL
- [ ] `/attendance` marks and prevents duplicate
- [ ] `/expiring` shows 7-day list
- [ ] `/report` shows correct monthly totals
- [ ] Scheduler sends reminders at 9 AM
- [ ] Razorpay auto-check updates payment status
- [ ] Broadcast reaches all members with telegram_id

---

*End of PRD v1.0.0 — GYM MANAGER TELEGRAM BOT*
