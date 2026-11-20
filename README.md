# Personal AI Vehicle Insurance Claims & Policy Management Application

A modern, full-stack vehicle insurance application designed for policyholders to manage policies, track personal claim progress, auto-extract policy terms using AI, run multi-modal visual damage inspections, and predict claim approval probability %.

---

## Architecture Overview

```
vehicle-insurance-application/
├── vehicle-insurance-backend/      # Spring Boot 3 / Java 17 REST API
│   ├── src/main/java/com/insurance/vehicle/
│   │   ├── modules/ai/             # AI Document Extraction, Negation Parser & Vision Engine
│   │   ├── modules/claim/          # User-Managed Claims Architecture & Timelines
│   │   ├── modules/policy/         # Policy Creation, Auto-Fill & Document Storage
│   │   ├── modules/payment/        # Payment Schedules & Installment Logs
│   │   ├── modules/notification/   # In-App Notifications & Progress Reminders
│   │   └── security/               # JWT Authentication & BCrypt Security
│   └── src/main/resources/db/migration/ # Flyway SQL Migrations
│
└── vehicle-insurance-frontend/     # React + Vite + TanStack Query + Tailwind CSS
    ├── src/
    │   ├── pages/user/             # Dashboard, Policies, Claims, Payments, Terms Analysis
    │   ├── pages/admin/            # Admin Claims, Dashboard, Analytics, User Management
    │   ├── components/ui/          # High-Contrast Slate Design System & Custom DatePicker
    │   ├── hooks/                  # React Query API Hooks
    │   └── router/                 # App Router & Auth Guards
```

---

## Quick Start Guide

### 1. Run the Backend (Spring Boot API)
Open a terminal in `./vehicle-insurance-backend` and run:

```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```
* Backend starts on `http://localhost:8080/api`

### 2. Run the Frontend (Vite + React)
Open a second terminal in `./vehicle-insurance-frontend` and run:

```bash
npm run dev
```
* Frontend launches on `http://localhost:5173`

---

## Demo Credentials

* **User**: `meet@gmail.com` / `password`
* **Admin**: `admin@vehicle.com` / `admin123`

---

## Key Technical Features

1. **User-Managed Claim Status Architecture**: Policyholders directly manage personal claim status (`Filed`, `Under Review`, `Approved`, `Rejected`, `Closed`) with real-time AI re-evaluations and timeline history logs.
2. **AI Repair Cost Negation Engine**: Intelligent negation parsing detects unaffected vehicle components (e.g. text saying *"windows appear unaffected"* no longer triggers glass replacement fees) for accurate workshop estimates (₹18,500).
3. **Multi-Modal Vision Inspector & Approval Predictor**: Multi-modal damage image scanning combined with payment accumulation data to calculate real-time **Claim Acceptance Chance %** (e.g. `98% Chance of Approval`).
4. **High-Contrast Slate Design System**: Clean typography (`text-sm` / 14px), 3-card option switchers, soft color pills (`Check` in emerald, `X` in rose, `AlertCircle` in amber), and 4-clause initial expander views with Framer Motion animations.
5. **Unified Payments Hub**: Single `/payments` hub with tabbed Due Schedule Calendar & Transaction Logs.
