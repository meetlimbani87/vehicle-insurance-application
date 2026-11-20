# Living Project Handoff & Progress Master Log

> **Read this file first before making changes.**
> This file is updated after every development cycle with full details on what was built, key decisions, active features, and current status.

---

## Executive Summary

The **Vehicle Insurance Application** is a full-stack personal AI insurance claims and policy management workspace. Policyholders can auto-extract policy terms from uploaded documents, visually inspect damage using multi-modal AI, track claim progress, update claim status as physical inspections progress, and predict claim approval probability %.

---

## System Architecture & Module Map

| Feature Area | Backend File(s) | Frontend Page / Component | Status |
|---|---|---|---|
| **Authentication** | `AuthController.java`, `SecurityConfig.java` | `LoginPage.tsx`, `RegisterPage.tsx` | ✅ Real (Postgres/H2 + JWT) |
| **Policy Creation & Auto-Fill** | `PolicyController.java`, `OpenAiPolicyExtractorClient.java` | `PolicyCreatePage.tsx`, `PolicyDetailPage.tsx` | ✅ Real (AI PDF Parsing + Persistence) |
| **User-Managed Claims** | `ClaimController.java`, `ClaimServiceImpl.java` | `ClaimTrackingPage.tsx`, `ClaimDetailPage.tsx` | ✅ Real (User status dropdowns + Timeline log) |
| **AI Damage & Negation Engine** | `OpenAiClaimAssessmentClient.java` | `ClaimDetailPage.tsx` | ✅ Real (Negation parser + ₹18,500 estimate) |
| **AI Vision & Approval Predictor** | `OpenAiDamageVisionClient.java` | `ClaimDetailPage.tsx` | ✅ Real (Base64 image scan + 98% Probability meter) |
| **Unified Payments & Billing** | `PaymentScheduleRepository.java` | `PaymentsPage.tsx` | ✅ Real (Calendar + Transaction Logs) |
| **Terms Analysis** | `PolicyAiAnalysisController.java` | `TermsAnalysisPage.tsx` | ✅ Real (3-Card Selector + 4-Clause Expander) |
| **Notifications & Reminders** | `NotificationServiceImpl.java` | `ClaimTrackingPage.tsx`, TopBar popover | ✅ Real (Daily pending claims banner + In-App) |
| **Admin Dashboard & Analytics** | `AdminController.java`, `AnalyticsService.java` | `AdminDashboardPage.tsx`, `AnalyticsPage.tsx` | ✅ Real (Live KPIs + Settlement metrics) |

---

## Major Technical Achievements & Design Decisions

### 1. User-Managed Claim Status Architecture
- **Decision**: Refactored backend permissions (`ClaimServiceImpl.java`) so policyholders tracking their personal claims can directly update claim status (`Filed`, `Under Review`, `Approved`, `Rejected`, `Closed`) from claim cards and Claim Details headers.
- **Impact**: Empowers users to manage their claim progression step-by-step as physical surveyor inspections take place.

### 2. AI Repair Cost Negation Parser Calibration
- **Decision**: Added negation parsing rules in `OpenAiClaimAssessmentClient.java` to detect unaffected vehicle components (e.g. text saying *"windows appear unaffected"* no longer triggers a ₹14,000 glass replacement fee).
- **Impact**: Calibrated workshop repair estimate for rear bumper & quarter-panel denting/scratching to total **₹18,500**.

### 3. High-Contrast Slate Minimalist Design System
- **Decision**: Replaced solid bright red pills with high-contrast slate cards, 14px readable typography (`text-sm`), and subtle icon accent pills (`Check` in emerald, `X` in rose, `AlertCircle` in amber).
- **Impact**: Removed redundant "Currently Viewing" banners to create a clean, uncluttered, state-of-the-art visual presentation.

### 4. 4-Clause Expander View with Framer Motion Animations
- **Decision**: Displays 4 itemized clauses by default with a smooth Framer Motion expander button (`Show All Clauses (+X more)` / `Show Less`).
- **Impact**: Eliminates long text dumps while giving users instant access to complete fine print clauses when desired.

---

## How to Run & Verify

1. **Backend**: `cd vehicle-insurance-backend && mvn spring-boot:run "-Dspring-boot.run.profiles=local"` (`http://localhost:8080/api`)
2. **Frontend**: `cd vehicle-insurance-frontend && npm run dev` (`http://localhost:5173`)
3. **Verify Build**: `npm run build` in `vehicle-insurance-frontend` compiles with 0 errors in ~4.5s.
