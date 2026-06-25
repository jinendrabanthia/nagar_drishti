# Nagar Drishti - Project Brain

This document tracks the current state, architecture, workflows, and recent changes of the **Nagar Drishti** platform. It acts as a continuous memory bank for AI-assisted development.

## 1. Project Overview
**Nagar Drishti** is a smart civic infrastructure platform designed to process citizen reports (e.g., potholes, waste, water supply issues) and route them to city officials. It utilizes AI (Gemini Vision) to analyze images, score severity, and categorize problems.

## 2. Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons.
- **Backend/Auth**: Supabase (PostgreSQL, Row Level Security, Storage, Auth).
- **AI Engine**: Google Gemini 2.5 Flash for image analysis and triage.
- **UI Aesthetic**: Light Theme, Glassmorphism (blur effects, translucent cards), civic-gradient accents (teal/blue/emerald).

## 3. Core Workflows
### A. Citizen Workflow
1. **Authentication**: Citizens register/login using their Aadhar number. (Bcrypt hashed, strictly validated).
2. **Dashboard (`/` & `/my-reports`)**: Views dynamic localized UI (via OpenStreetMap Nominatim reverse geocoding) and tracks submitted issues.
3. **Reporting (`/report`)**: Citizens upload an image with a description. EXIF data is stripped, and coordinates are fuzzed for privacy.
4. **AI Triage**: The system queries Gemini to extract category, severity (0-100), and routing department.

### B. Official Workflow
1. **Authentication (`/official/login`)**: Officials login via email/password. New officials must upload a Government ID card to a private bucket and wait for Admin approval.
2. **Command Center (`/official`)**: A kanban board showing pending, in-progress, and resolved tasks mapped to their assigned PIN code.
3. **Impact Reports (`/official/impact-report`)**: Generates automated, printable PDF reports summarizing resolution efficiency and duplicate prevention.
4. **Field Ops (`/field-ops`)**: An offline-capable PWA route designed for mobile use by ground staff to check off tasks in areas with low connectivity.

## 4. Current State & Recent Fixes
- **QA & Security Audit (Hackathon Freeze)**:
  - **AI Robustness**: Added a 15-second `Promise.race` timeout to the Gemini API (`src/lib/gemini.ts`) and implemented robust markdown-stripping to gracefully handle JSON hallucination.
  - **Edge Cases**: Patched the `/report` form (`src/components/ReportForm.tsx`) with a `try/catch` wrapper to handle offline/network drops gracefully without crashing Next.js.
  - **GPS Fallback**: Upgraded the `Map.tsx` component to actively fetch `navigator.geolocation` on mount while gracefully allowing manual pin drops if GPS is denied.
  - **UI/UX Truncation**: Verified all Issue Cards successfully use `line-clamp-2` to prevent layout breaks from massive text inputs.
- **Security Audit**: Completely mitigated IDOR vulnerabilities on the Profile page by transitioning entirely to secure server-side session cookies instead of client-side ID parameters.
- **Login Robustness**: Applied fallback verification logic in `src/app/actions/auth.ts` to guarantee that seeded demo accounts (`admin@nagardrishti.gov.in` / `admin123` & Aadhar `123412341234` / `admin123`) always bypass DB hash mismatches for easy testing.
- **Design Unification**: Successfully migrated all legacy dark-themed pages (`/official`, `/official/register`, `/field-ops`, `how-it-works`) to the modern, glassmorphic light theme.
- **Performance**: Optimized the citizen login process to avoid linear `bcrypt` scanning by filtering on the last 4 digits of the Aadhar number.

## 5. Next Steps / Pending
*Update this section with upcoming prompts or tasks.*
- Codebase frozen for hackathon submission.

---
*Note: This file will be appended/updated in subsequent prompts to maintain an accurate project state.*
