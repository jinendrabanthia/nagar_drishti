# CivicTriage AI

CivicTriage AI is a modern, AI-powered platform for reporting, triaging, and resolving city infrastructure issues. Built for GovTech, it leverages Google's Gemini AI to instantly analyze citizen reports, score their severity, and route them to the appropriate city department—saving thousands of hours of manual triage time.

The platform utilizes a bespoke **Civic Modernism** design language featuring deep navy backgrounds, civic teal accents, glassmorphic cards, and dynamic UI micro-interactions for a premium, accessible user experience.

## 🌟 Advanced Features

### For Citizens
* **Secure Registration:** Citizens can create accounts securely with privacy-preserving data handling (Aadhar hashing, location fuzzing).
* **Instant Multilingual Reporting:** Report potholes, graffiti, and hazards. Speak or type in your native language—the AI automatically translates and standardizes reports for city officials.
* **Voice-to-Text Accessibility:** Includes built-in Web Speech API integration to allow citizens to dictate their reports easily.
* **Interactive Mapping:** Select exact report locations on a live Leaflet map with PIN Code auto-centering for rapid geographical lookup.
* **My Reports Tracking & Timeline:** A dedicated, highly styled dashboard for tracking real-time status. Features an interactive **"Before & After" Transparency Slider** to view infrastructure improvements once an official resolves a ticket.

### For City Officials (Command Center)
* **Identity Verification:** Strict City Official onboarding path. Officials must upload Government ID cards which are securely stored in private cloud buckets with time-limited signed URL access. Accounts remain pending until admin approval.
* **AI Triaging & Emergency Hazard Escalation:** Google Gemini AI automatically processes every image uploaded to:
  - Categorize the issue and assign a Severity Score (0-100).
  - Automatically detect life-threatening emergencies (live wires, sinkholes) and escalate them to Severity 100 with pulsing red UI alerts.
* **Legacy System RPA Integration (GovNet95):** A dedicated RPA bridge generates normalized JSON payloads from AI triaged data. Features a visual simulator demonstrating automated data entry into legacy mainframe systems.
* **Offline-First Field Operations:** Built for municipal workers in poor-connectivity areas. Workers can securely cache their assigned tasks, travel to the site, update statuses, upload resolution proof photos, and queue updates completely offline using Service Workers and IndexedDB.
* **Automated Impact Reports:** One-click generation of executive summaries and metrics (labor hours saved, duplicates caught) using Gemini. The reports feature a clean print-ready CSS layout perfect for PDF exports for city councils.

## 🛠 Tech Stack

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
* **Backend:** Next.js Server Actions, Node.js
* **Database & Storage:** Supabase (PostgreSQL with PostGIS for spatial mapping), Supabase Storage
* **Security & Auth:** Next.js Cookies, `bcryptjs` encryption, Row Level Security (RLS), Data Fuzzing
* **AI Integration:** `@google/genai` (Gemini 2.5 Flash API)
* **Offline Capabilities:** Service Workers (`sw.js`), IndexedDB wrapper (`idb`)
* **Mapping:** `react-leaflet`, OpenStreetMap API

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/jinendrabanthia/civic_triage.git
cd civic_triage/civic-triage-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root of the project using `.env.example` as a template:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Database & Storage Setup (Supabase)
This project uses PostGIS for geographic lookups and strict RLS for privacy.
1. Log into your Supabase project.
2. Go to the SQL Editor.
3. Open `supabase_schema.sql` and run the entire script. This will:
   - Create the `reports`, `citizens`, and `officials` tables.
   - Configure Row Level Security (RLS) for all tables.
   - Create necessary RPC functions.
4. Go to **Storage** in Supabase and ensure the creation of:
   - `report-images` (Public bucket for citizen uploads)
   - `official-id-cards` (Private bucket for official verification)
   - `resolved-images` (Public bucket for resolution proof)

### 5. Seed Demo Data (Optional)
To quickly populate the dashboard with realistic, localized reports:
```bash
npx tsx scripts/seed-demo-data.ts
```

### 6. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to start exploring.

## 🧪 Testing Credentials

To make testing easier, the database schema includes pre-created demo accounts for both an Official and a Citizen.

### Official (Command Center)
* **Login URL:** `/official/login`
* **Email:** `admin@civictriage.gov.in`
* **Password:** `admin123`
* **Role:** City Admin (Mumbai, Maharashtra)

### Citizen (Public App)
* **Login URL:** `/` (Homepage)
* **Aadhar Number:** `123412341234`
* **Password:** `admin123`

*Note: You can also register a new official via `/official/register` (requires manual DB approval) or a new citizen directly from the homepage.*

* **Offline Mode**: To test Field Ops, navigate to `/field-ops`, click "Cache Tasks", then disconnect your network (or use Chrome DevTools Offline throttling) and attempt to resolve a task.

---
Built for Vibe2Ship Hackathon by Jinendra Banthia.
