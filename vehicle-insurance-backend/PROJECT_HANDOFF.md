# Project Notes

Running log of what's done and what's next. Update it when you finish something.

---

## 1. What this project actually is

A personal AI vehicle insurance claims management & policy analysis platform. The app empowers policyholders to upload policy documents, auto-extract coverage terms, run AI damage assessments, track personal claim progress, and predict claim approval probability %.

Stack: Spring Boot 3 / Java 17 / Postgres / Flyway (backend), React + Vite + TanStack Query + Tailwind + Framer Motion (frontend). Full setup instructions are in `README.md`.

## 2. Status Legend

- **Real** - actual Postgres-backed entity/repo/service/controller, no mock/dummy data left, frontend hook calls the real API.
- **Partial** - some of the above is real, some isn't (details given inline).
- **Dummy** - still using fake data or static fallbacks.

## 3. Page Mapping & Module Status

### User-facing pages (`src/pages/user/`)

| Page | Backend module(s) | Status |
|---|---|---|
| `DashboardPage` | Policy, Claim | **Real** - Reads real live policy, claim, and payment status data |
| `ApplicationsPage` | Policy, Claim | **Real** - Filtered view over policies+claims with styled `EmptyState` cards & safety array guards |
| `PolicyCreatePage` / `PolicyDetailPage` | Policy, AI | **Real** - AI Auto-Fill workflow: user uploads policy document, AI scans PDF/image text, pre-fills all fields, persists policy to Postgres. Features 3 top metric option cards, soft high-contrast slate cards, and 4-clause initial expander views. |
| `ClaimCreatePage` / `ClaimDetailPage` / `ClaimTrackingPage` | Claim, AI | **Real** - User-Managed Claim Status Architecture: User files claim using custom `DatePicker`, updates status (`Filed`, `Under Review`, `Approved`, `Rejected`, `Closed`), triggers server-side AI claim assessment (`POST /claims/{id}/ai-assessment`), evaluates coverage dates, calculates repair costs, and populates `claim_damage_points`. Features daily pending claims reminder banner and user status dropdowns. |
| `PaymentsPage` | Payment | **Real** - Unified Payments & Billing hub: Tabbed Due Schedule Calendar + Transaction Logs & Receipts with fixed uncontrolled `Tabs` support (`defaultValue`) and styled `EmptyState` cards. |
| `NotificationsPage` | Notification | **Real** - In-app notification popover and page created as side effects of Policy/Claim/Payment actions |
| `ProfilePage` | User | **Real** - `GET/PATCH /users/me`, password change, notification preference toggles |
| `TermsAnalysisPage` | AI | **Real** - AI Policy Terms Analysis: Interactive 3-card category selector (`Included Coverage`, `Policy Exclusions`, `Limits & Terms`), 4-item initial limit with smooth Framer Motion expander, and high-contrast typography. |

### Admin pages (`src/pages/admin/`)

| Page | Backend module(s) | Status |
|---|---|---|
| `AdminClaimsPage` | Claim, AI | **Real** - Admin status view, displays AI damage points & eligibility confidence scores |
| `AdminDashboardPage` | Admin | **Real** - KPIs (`totalPolicies`, `totalClaims`, `claimedCount`, `unclaimedCount`, `premiumCollected`), Live Monthly Claims chart & Vehicle Distribution |
| `AdminUsersPage` | Admin/User | **Real** - `GET/PATCH /admin/users`, role-locked (`hasRole("ADMIN")`). Suspending a user blocks session immediately |
| `AuditLogsPage` | Audit | **Real** - `GET /admin/audit-logs`, admin-only audit trail |
| `AnalyticsPage` | Analytics | **Real** - Claims by Month, Policy Status Breakdown, Vehicle Categories, Avg Settlement Time |

---

## 4. Key Accomplishments & Features Built

1. **Auth & User Management** - Postgres `users` table, BCrypt password hashing, signed JWT tokens.
2. **Policy & Vehicle Module** - `Policy`/`Vehicle` entities, deterministic premium calculation (`PremiumCalculatorService`), vehicle reuse-by-registration-number on renewal, document uploads on local disk.
3. **Audit Logging** - `AuditLog` entity/repo/service. `record(...)` wired into every Policy/Claim/AI action.
4. **User-Managed Claim Status Architecture** - Refactored status permissions so policyholders tracking their personal claims can directly update claim status (`Filed`, `Under Review`, `Approved`, `Rejected`, `Closed`) right from claim cards and Claim Details header bar.
5. **AI Claim Repair Cost Negation Engine (`OpenAiClaimAssessmentClient.java`)**:
   - Added negation parsing for unaffected vehicle components (e.g. text saying *"windows appear unaffected"* no longer triggers a ₹14,000 glass replacement fee).
   - Workshop repair estimate for rear bumper & quarter-panel denting/scratching correctly totals **₹18,500**.
6. **Multi-Modal Vision Damage Inspector & Payment-Adjusted Approval Predictor Engine**:
   - `OpenAiDamageVisionClient`: Base64 image payload scanning for damaged vehicle parts & photo-to-description consistency match %.
   - `PaymentScheduleRepository`: Calculates total accumulated premiums paid and payment standing to compute final **Claim Acceptance Chance %** (e.g. `98% Chance of Approval`).
7. **Unified Payments Hub (`PaymentsPage.tsx`)**:
   - Merged `PaymentSchedulePage` and `PaymentLogsPage` into a single `/payments` page with tabbed Due Schedule Calendar & Transaction Logs.
   - Fixed `tabs.tsx` to support uncontrolled `defaultValue` mode.
8. **High-Contrast Slate Design System**:
   - Replaced solid bright red pills with high-contrast slate cards, 14px readable typography (`text-sm`), and subtle icon accent pills (`Check` in emerald, `X` in rose, `AlertCircle` in amber).
   - Removed duplicate "Currently Viewing" banners to maximize screen space.
9. **Spacious 4-Clause Expander & Framer Motion Animations**:
   - Displays 4 items by default with a smooth Framer Motion expander button (`Show All Clauses (+X more)` / `Show Less`).
10. **Daily Pending Claims Reminder System**:
    - High-visibility banner on `ClaimTrackingPage.tsx` reminding users to update active pending claims.

---

## 5. Next Steps

1. **User Testing & Feedback Collection** - Continue refining UI interactions and user feedback.
