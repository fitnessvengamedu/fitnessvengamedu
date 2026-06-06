# 🏋️ S FITNESS — Elite Gym Management Platform

> A full-stack, production-ready gym management system combining a premium Next.js web application with a dual Telegram bot system for trainers and members — built for **S FITNESS**, located in Karur, Tamil Nadu.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green?logo=supabase)](https://supabase.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue?logo=razorpay)](https://razorpay.com)
[![Python](https://img.shields.io/badge/Python-3.11%2B-yellow?logo=python)](https://python.org)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Web Application](#-web-application)
  - [Public Pages](#public-pages)
  - [Authentication](#authentication)
  - [Member Dashboard](#member-dashboard)
  - [Admin Panel](#admin-panel)
  - [Gallery](#gallery)
- [API Routes](#-api-routes)
- [Telegram Bots](#-telegram-bots)
  - [Member Bot](#member-bot-user_botpy)
  - [Trainer Bot](#trainer-bot-trainer_botpy)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)

---

## 🏋️ Project Overview

S FITNESS is a complete gym management solution featuring:

- **Premium Marketing Website** with cinematic animations and 3D parallax effects
- **Secure Member Portal** with digital membership cards, BMI calculator, and goal tracking
- **Admin Control Panel** for member management and gallery uploads
- **Dual Telegram Bot System** — one bot for members, one for trainers/owners
- **Automated Payment Processing** via Razorpay subscriptions
- **Live Google Reviews** integration via Places API
- **Bi-weekly Telegram Alerts** and renewal reminders via automated cron system

---

## 🛠️ Tech Stack

### Frontend / Web
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.7 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion v12 |
| 3D Rendering | Three.js v0.184 |
| Smooth Scroll | Lenis v1.3 |
| UI Icons | Lucide React v1.17 |
| State Management | Zustand v5 |
| Image Export | html-to-image |

### Backend / Database
| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Phone OTP) |
| ORM | `@supabase/supabase-js` v2 + `@supabase/ssr` |
| Payments | Razorpay v2.9 (Subscriptions + Payment Links) |
| Reviews | Google Places API (server-side, cached 5 min) |
| Gallery Storage | Google Drive API v3 |

### Telegram Bots (Python)
| Layer | Technology |
|---|---|
| Language | Python 3.11+ |
| Framework | pyTelegramBotAPI (telebot) |
| Database | Supabase Python SDK |
| Payments | Razorpay Python SDK |
| Scheduler | APScheduler (background cron) |
| Timezone | pytz |

---

## 🏗️ Architecture

```
fitness app/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Homepage (Landing Page)
│   │   ├── layout.tsx           # Root layout (fonts, navigation)
│   │   ├── about/               # About page
│   │   ├── services/            # Services page
│   │   ├── gallery/             # Gallery viewer page
│   │   ├── review/              # Reviews page
│   │   ├── feedback/            # Feedback form page
│   │   ├── signin/              # Sign-in page
│   │   ├── signup/              # Sign-up / Registration page
│   │   ├── forgot-password/     # Forgot password flow
│   │   ├── reset-password/      # Reset password flow
│   │   ├── auth/                # Auth callback handlers
│   │   ├── dashboard/           # Member dashboard (protected)
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── actions.ts       # Server actions (goal save)
│   │   │   ├── card/            # Digital card standalone view
│   │   │   └── goals/           # Daily goals tracker
│   │   ├── admin/               # Admin panel (role-protected)
│   │   └── api/                 # API Routes
│   │       ├── reviews/         # Google Places reviews proxy
│   │       ├── gallery/         # Gallery sync from Google Drive
│   │       ├── diet/            # AI diet protocol generator
│   │       ├── telegram/
│   │       │   ├── cron/        # Bi-weekly alert cron endpoint
│   │       │   ├── member/      # Member bot webhook
│   │       │   └── trainer/     # Trainer bot webhook
│   │       ├── razorpay/
│   │       │   ├── create-subscription/  # Subscription creation
│   │       │   ├── plans/       # Fetch available plans
│   │       │   ├── qr/          # Razorpay QR code
│   │       │   └── webhook/     # Payment event handler
│   │       └── admin/
│   │           └── upload/      # Gallery upload to Drive
│   ├── components/              # Reusable UI components
│   │   ├── AdminPanelClient.tsx # Admin panel UI
│   │   ├── BmiCalculator.tsx    # BMI calculator widget
│   │   ├── DailyLogForm.tsx     # Daily workout/nutrition log
│   │   ├── DietProtocol.tsx     # AI-generated diet plan viewer
│   │   ├── DigitalCard.tsx      # Digital membership card
│   │   ├── GoalTracker.tsx      # Fitness goals manager
│   │   ├── GymCanvas3D.tsx      # Three.js 3D canvas
│   │   ├── IDCardWrapper.tsx    # Membership card toggle wrapper
│   │   ├── RazorpayCheckoutButton.tsx  # Payment button
│   │   ├── RazorpayQRCode.tsx   # QR code payment widget
│   │   ├── ReviewsSection.tsx   # Google Reviews widget
│   │   ├── SmoothScroll.tsx     # Lenis scroll wrapper
│   │   ├── StandaloneCardViewer.tsx  # Full-page card viewer
│   │   └── TopNavBar.tsx        # Navigation bar
│   ├── middleware.ts             # Auth session middleware
│   └── utils/supabase/          # Supabase client helpers
├── trainer_bot.py               # Trainer/Admin Telegram Bot
├── user_bot.py                  # Member Telegram Bot
├── GYM_BOT_PRD.md               # Bot product requirements doc
├── Design.md                    # Visual design system
└── scripts/                     # Utility scripts
```

---

## 🌐 Web Application

### Public Pages

#### 🏠 Homepage (`/`)
- **Cinematic Hero Section** with full-screen parallax background image and scroll-driven animations
- **Interactive 3D Tilt Card** — The hero gym photo responds to mouse movement with smooth spring physics using Framer Motion
- **Live Noise & Scanline Overlays** for a high-tech aesthetic
- **Equipment Showcase Section** with "Live Feed" HUD overlay and glassmorphism telemetry panel
- **Elite Capabilities Bento Grid** — 3-card layout showcasing Kinetic Revolution, Biometric Mastery, and Neural Reset
- **Telemetry Stats Section** — VO2 Max gain (+14% avg), Recovery speed (2.4X faster) with animated progress bars
- **Pricing Cards** — Core and Elite Apex plan tiers with Razorpay integration links
- **Live Google Reviews Widget** — server-fetched from Google Places API with 5-minute edge caching and fallback reviews

#### 📖 About Page (`/about`)
- Gym history, trainer profiles, and facility information

#### 🏋️ Services Page (`/services`)
- Complete list of training programs and membership offerings

#### ⭐ Reviews Page (`/review`)
- Dedicated full-page reviews view pulling from Google Places API

#### 💬 Feedback Page (`/feedback`)
- Feedback submission form

### Authentication

#### Sign In (`/signin`)
- Email + password authentication via Supabase Auth
- Role-based redirect: admins → `/admin`, members → `/dashboard`
- Error state handling with inline feedback

#### Sign Up (`/signup`)
- Full member registration with:
  - Full name, email, password
  - Phone number (Indian format)
  - Blood group selection
  - Address fields (street, area, district)
  - Age, gender
  - Fitness goal selection
  - Target weight and calorie targets
- All data stored to Supabase Auth `user_metadata` + `profiles` table
- Auto-assigns a sequential member ID

#### Forgot / Reset Password (`/forgot-password`, `/reset-password`)
- Supabase magic-link based password reset flow

#### Auth Middleware (`src/middleware.ts`)
- Supabase SSR session refresh on every request
- Protects all routes except static assets

---

### Member Dashboard (`/dashboard`)

Accessible only to authenticated non-admin members. Automatically redirects admins to `/admin`.

#### 🪪 Elite Profile Card
Displays member info fetched from `profiles` table and `user_metadata`:
- Full Name, Blood Group
- Phone number, Address / Sector
- Role badge and email

#### 💳 Digital Membership Card (IDCardWrapper + DigitalCard)
- A **credit-card-styled membership card** with:
  - S FITNESS Elite branding
  - EMV Gold chip graphic
  - Embossed 4-digit member ID
  - Cardholder name with telemetry metadata (Age, Gender, Plan)
  - "Since" and "Thru" dates calculated from active subscription
  - Rainbow hologram badge
  - Hover shimmer animation
- **Toggle viewer** in the dashboard to preview/hide the card
- **Standalone route** at `/dashboard/card` for full-page view with print/download capability

#### 🏃 Goal Tracker (`GoalTracker.tsx`)
- Set up to **3 simultaneous fitness goals**, each with:
  - Objective (Weight Loss, Muscle Gain, Endurance, Powerlifting, etc.)
  - Target weight (kg) and daily calorie target (kcal)
  - Target deadline (date picker)
  - Active/inactive toggle to switch between goals
- **Real-time progress bars** showing today's calorie and water intake vs targets
- Goals persisted to Supabase via server action `updateGoalsList()`
- Daily log link to `/dashboard/goals` for detailed tracking

#### 📊 BMI Telemetry Calculator (`BmiCalculator.tsx`)
- Gender selector (Male/Female) with distinct recommendations
- Height (cm) + Weight (kg) inputs
- Calculates BMI to one decimal point
- **Visual segmented gauge** with animated pointer cursor covering:
  - Underweight < 18.5 (blue)
  - Optimal 18.5–25 (lime green)
  - Overweight 25–30 (amber)
  - Obese ≥ 30 (rose red)
- **Gender-specific composition insights** with body fat percentage ranges

#### 🥗 Diet Protocol (`DietProtocol.tsx`)
- AI-generated personalised diet plan based on the member's fitness goal
- Calorie target integration from GoalTracker

#### 📱 Telegram Integration Widget
- Detects if member's Telegram account is linked (`telegram_chat_id` in metadata)
- Shows **"Link Device" button** that opens the member bot with a deep-link `?start=<user_id>` payload
- Displays **"Status: Connected"** badge once linked

---

### Admin Panel (`/admin`)

Role-protected route (role = 'admin' in `profiles` table). Redirects non-admins.

#### 👥 Members Tab
- Full paginated list of all registered members
- Search by name or phone number
- Per-member view showing:
  - Full profile details (name, phone, blood group, address, age, gender)
  - Member ID and account creation date
  - Active subscription status with plan type and expiry date
  - Razorpay subscription ID
  - External profile link
- Summary statistics: Total members, Active subscriptions, Inactive members

#### 📤 Gallery Upload Tab
- Upload images and videos directly to Google Drive via the admin panel
- Event name tagging for categorisation
- Batch upload with individual file progress tracking
- Upload status indicators (success / error per file)
- Automatic public link generation after upload

#### 🔐 Sign Out
- Session termination button in the top-right of the dashboard

---

### Gallery (`/gallery`)

#### 📸 Media Grid
- Fetches all gallery items from Google Drive via the backend API
- Stores in `gallery_items` Supabase table as the cache layer
- **LocalStorage caching** for instant page load
- Dynamic event filter pills for filtering by event name
- Grid of media thumbnails with animated hover effects and lazy loading
- Google Drive image resizing parameter (`=w500`) for optimized thumbnails

#### 🎬 Lightbox / Video Player Modal
- Click any thumbnail to open a full-size lightbox
- Image viewer with `=w1000` resolution
- Video player with native HTML5 controls and autoplay
- `referrerPolicy="no-referrer"` on all Google User Content images

#### 🔄 Admin Sync Control
- Admins see a "Re-sync Stream" button that triggers a fresh Google Drive API fetch
- Live "Google Drive Stream Online" status indicator

---

## 🔌 API Routes

### `GET /api/reviews`
- Fetches live Google Places reviews for S FITNESS using the server-side `GOOGLE_PLACES_API_SERVER_KEY`
- Filters reviews with rating ≥ 3 stars
- Edge-cached for 5 minutes (`next: { revalidate: 300 }`)
- Falls back to hardcoded verified reviews if API is unavailable

### `GET/POST /api/gallery`
- Syncs media items from Google Drive to the `gallery_items` Supabase table
- Optional `?sync=true` parameter to force a fresh Drive fetch

### `POST /api/admin/upload`
- Handles file upload from the Admin Panel to Google Drive
- Sets public read permission immediately after upload (`role: reader`, `type: anyone`)
- Returns the public Google User Content URL

### `POST /api/razorpay/create-subscription`
- Creates a new Razorpay subscription linked to a plan ID
- Attaches `userId` in `notes` for webhook reconciliation

### `GET /api/razorpay/plans`
- Returns all available Razorpay subscription plans

### `GET /api/razorpay/qr`
- Returns a Razorpay QR code for UPI payments

### `POST /api/razorpay/webhook`
Handles Razorpay payment events:
- **`subscription.charged`** → Updates subscription status, payment ID, plan, and period dates in `subscriptions` table
- **`subscription.cancelled`** / **`subscription.halted`** → Updates subscription status to cancelled/halted
- HMAC-SHA256 signature verification against `RAZORPAY_WEBHOOK_SECRET`

### `GET/POST /api/telegram/cron`
Authorized cron endpoint (Bearer token or `?secret=` query param):

1. **Bi-Weekly Check-in Alerts** — Sends personalised progress update messages to all active members with Telegram linked, if 14 days have passed since last alert
2. **7-Day Renewal Reminders** — Sends renewal alerts to members whose subscription expires within 7 days:
   - Sends personal reminder to the member's Telegram chat
   - Sends admin notification to the owner's Telegram chat via the trainer bot
   - Deduplicates using `last_payment_reminder_sent_for` metadata field

---

## 🤖 Telegram Bots

### Member Bot (`user_bot.py`)

A Python bot for **gym members** to link their account and receive updates.

#### Commands & Features
| Command / Trigger | Description |
|---|---|
| `/start <user_id>` | Deep-link handler — automatically links member's Telegram to their S FITNESS account |
| `/start` (no payload) | Shows welcome message with instructions |
| `/help` | Instructions on how to link account |
| Email input (text) | Member can type their registered email to self-link their Telegram account |

#### Linking Flow
1. Member clicks "Link Device" in their dashboard → Opens bot with `?start=<user_id>` payload
2. Bot retrieves user from Supabase Auth Admin by ID
3. Updates `user_metadata.telegram_chat_id` and `telegram_linked: true`
4. Also updates `profiles.telegram_chat_id` (graceful fallback if column missing)
5. Confirms linking to the member

---

### Trainer Bot (`trainer_bot.py`)

A Python bot for **gym trainers and owners** with full gym management capabilities.

#### Access Control
- **Strict Whitelist:** Only Telegram IDs in `ALLOWED_TELEGRAM_IDS` can interact with the bot
  - Currently includes: `8250992325` (testing), plus any IDs from `TELEGRAM_OWNER_CHAT_ID` and `ADMIN_TELEGRAM_IDS` in `.env`
- **Role Resolution:** Looks up user roles from Supabase Auth `user_metadata` (not profiles table)
- **`@admin_only` decorator:** Blocks unauthorized users immediately
- **`@owner_only` decorator:** Restricts owner-exclusive commands

#### Trainer Commands

| Command | Access | Description |
|---|---|---|
| `/start` | Admin | Shows welcome message and command reference with inline keyboard shortcuts |
| `/dashboard` | Admin | **Live gym telemetry** — Total members, Telegram-linked count, Active/Expired subscriptions, Estimated MRR |
| `/members` | Admin | Paginated roster of all gym members with status, plan, and expiry date |
| `/search <name or phone>` | Admin | Fuzzy search member profiles with full detail card view |
| `/pending` | Admin | Lists all members with expired or unpaid memberships |
| `/expiring` | Admin | Lists members whose membership expires within 7 days with quick reminder button |
| `/attendance` | Admin | Check-in a member or view today's present list |
| `/viewattendance` | Admin | 7-day attendance bar chart report |
| `/payment` | Admin | Record a manual cash/UPI payment — extends membership expiry date |
| `/paymentlink <name or phone>` | Admin | Generate and send a Razorpay payment link directly to the member |
| `/history <name or phone>` | Admin | View a member's payment history and subscription status |
| `/fee_summary` | Admin | Today's total collection breakdown (cash vs Razorpay) |
| `/myassigned` | Admin | Shows all gym members assigned to the calling trainer |
| `/notes <phone/email> <note>` | Admin | Appends a workout/progress note attributed to the trainer |
| `/broadcast <message>` | **Owner only** | Sends a message to all active members via the member bot |
| `/addadmin <phone or email>` | **Owner only** | Promotes a member to admin/trainer role |
| `/removeadmin <phone or email>` | **Owner only** | Demotes a trainer back to member role |
| `/export` | **Owner only** | Generates and sends a full member roster as a CSV file |

#### Automated Scheduler (APScheduler)
- **9:00 AM daily** — Sends expiry alerts to owner for members expiring in 3 days
- **9:05 AM daily** — Sends broadcast renewal reminders to members expiring in 3 days
- **10:00 PM daily** — Payment sync health check

#### Razorpay Integration
- Generates custom payment links via the Razorpay REST API
- Links include member's name, phone, and plan amount
- Sends the link directly to the trainer chat and optionally to the member

---

## 🗄️ Database Schema

### `profiles` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID (FK → auth.users) | User identifier |
| `full_name` | text | Member full name |
| `phone` | text | Phone number |
| `role` | text | `member`, `admin`, `trainer`, `owner` |
| `blood_group` | text | Blood group |
| `street`, `area`, `district` | text | Address fields |
| `age` | int | Age |
| `gender` | text | Gender |
| `member_id` | text | Sequential gym member ID |
| `telegram_chat_id` | text | Linked Telegram chat ID |
| `created_at` | timestamptz | Registration date |

### `subscriptions` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Subscription record ID |
| `user_id` | UUID (FK → profiles.id) | Member reference |
| `razorpay_subscription_id` | text | Razorpay subscription ID |
| `razorpay_payment_id` | text | Last payment ID |
| `plan_id` | text | Razorpay plan ID |
| `status` | text | `active`, `cancelled`, `halted` |
| `current_period_start` | timestamptz | Billing period start |
| `current_period_end` | timestamptz | Membership expiry date |
| `updated_at` | timestamptz | Last updated |

### `gallery_items` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Gallery item ID |
| `event_name` | text | Event category tag |
| `file_url` | text | Public Google User Content URL |
| `file_type` | text | `image` or `video` |
| `created_at` | timestamptz | Upload date |

### Auth Metadata (`user_metadata` JSONB)
Key fields stored in Supabase Auth user_metadata (used by the bots):
- `full_name`, `phone`, `blood_group`, `age`, `gender`
- `street`, `area`, `district`
- `fitness_goal`, `target_weight`, `target_calories`, `target_timeframe`
- `goals_list` (array of goal objects)
- `daily_logs` (array of daily nutrition/workout logs)
- `telegram_chat_id`, `telegram_linked`
- `last_telegram_alert_at` (bi-weekly cron deduplication)
- `last_payment_reminder_sent_for` (renewal reminder deduplication)
- `attendance` (array of date strings for check-in tracking)
- `notes` (array of trainer progress notes)
- `assigned_trainer` (trainer name)
- `role` (for bot role resolution)

---

## 🔐 Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
# ── Supabase ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Razorpay ──────────────────────────────────
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY=plan_xxxx
NEXT_PUBLIC_RAZORPAY_PLAN_QUARTERLY=plan_xxxx
NEXT_PUBLIC_RAZORPAY_PLAN_HALFYEARLY=plan_xxxx
NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY=plan_xxxx

# ── Google ────────────────────────────────────
GOOGLE_PLACES_API_SERVER_KEY=AIzaSy...
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJ...
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id

# ── Telegram ──────────────────────────────────
TELEGRAM_MEMBER_BOT_TOKEN=123456:ABC...
TELEGRAM_TRAINER_BOT_TOKEN=123456:DEF...
TELEGRAM_OWNER_CHAT_ID=123456789
ADMIN_TELEGRAM_IDS=123456789,987654321
TELEGRAM_MEMBER_BOT_USERNAME=My_fitnesz_gym_bot

# ── App ───────────────────────────────────────
NEXT_PUBLIC_APP_NAME=S FITNESS
NEXT_PUBLIC_APP_URL=https://sfitness.qzz.io
CRON_SECRET=your_cron_secret_key

# ── Vercel Cron (vercel.json) ─────────────────
# Schedule: 0 9 * * * (daily 9 AM IST)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- A Supabase project
- A Razorpay account (with subscription plans created)
- A Google Cloud project (Places API + Drive API enabled)
- Two Telegram bots (created via @BotFather)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd fitness-app

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
pip install telebot supabase razorpay apscheduler pytz python-dotenv

# 4. Configure environment variables
cp .env.example .env
# Fill in all required values in .env

# 5. Start the Next.js development server
npm run dev

# 6. Start the Member Bot (in a separate terminal)
python user_bot.py

# 7. Start the Trainer Bot (in a separate terminal)
python trainer_bot.py
```

The Next.js app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📦 Deployment

### Next.js Web App → Vercel

```bash
# Build for production
npm run build

# Deploy to Vercel (via CLI or Git push to main)
vercel --prod
```

Configure all environment variables in the Vercel project dashboard.

**Vercel Cron Job** — Add this to `vercel.json` to automate bi-weekly alerts:
```json
{
  "crons": [{
    "path": "/api/telegram/cron",
    "schedule": "0 3 * * *"
  }]
}
```
*(Runs at 3:30 AM UTC = 9:00 AM IST daily)*

### Python Bots → Linux Server (systemd)

Create `/etc/systemd/system/sfitness-bots.service`:

```ini
[Unit]
Description=S FITNESS Telegram Bots
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/fitness-app
ExecStart=/usr/bin/python3 trainer_bot.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable sfitness-bots
sudo systemctl start sfitness-bots
```

---

## 📊 Feature Summary

| Feature | Status |
|---|---|
| Premium Landing Page | ✅ |
| 3D Tilt + Parallax Hero | ✅ |
| Member Auth (Email + Phone) | ✅ |
| Role-Based Access Control | ✅ |
| Member Dashboard | ✅ |
| Digital Membership Card | ✅ |
| BMI Telemetry Calculator | ✅ |
| Fitness Goal Tracker (multi-goal) | ✅ |
| Daily Log Form | ✅ |
| Diet Protocol Widget | ✅ |
| Razorpay Subscriptions | ✅ |
| Razorpay Payment Links (Bot) | ✅ |
| Razorpay Webhook | ✅ |
| Google Reviews (live sync) | ✅ |
| Gallery (Drive-synced) | ✅ |
| Admin Panel | ✅ |
| Member Telegram Bot | ✅ |
| Trainer Telegram Bot | ✅ |
| Bot Whitelist Access Control | ✅ |
| Bi-Weekly Alert Cron | ✅ |
| Renewal Reminder Cron | ✅ |
| CSV Export | ✅ |
| Owner Broadcast | ✅ |
| APScheduler Daily Tasks | ✅ |

---

## 👤 Author

Built for **S FITNESS** — Karur, Tamil Nadu, India  
Trainer: **Mr. Shanmugham** | Platform: Apex Elite v0.5.2

---

*This README was generated from the current codebase as of June 2026.*
