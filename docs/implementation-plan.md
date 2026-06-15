# Project Implementation Plan

This implementation plan details the ten phases of development executed to construct the **Vendor Performance Rating & Blacklist System** for SLV Events.

---

## 📅 Phase 1: Requirement Understanding
* **Stakeholder Objective:** Build an internship-review-ready vendor management system for SLV Events to rate event suppliers, auto-calculate performance indexes, manage warnings, and blacklist unreliable vendors.
* **Core Functional Pillars Identified:**
  * Mock login with multiple staff roles (Admin, Planner, Coordinator, Finance, Operations).
  * Dashboard analytical metrics and charting widgets.
  * Vendor directories with multi-field search and filters.
  * Granular rating forms with automated weight calculations.
  * Automatic warning and blacklist logic triggers.
  * Manual override log trails.
  * Recommendation matches based on category, event type, and reliability standing.
  * Analytical report generators with spreadsheet CSV exports.
  * Configurable settings page for mathematical weights and thresholds.

## 🎨 Phase 2: UI/UX Design
* **Brand Persona:** Designed a premium, dark-themed SaaS aesthetic suitable for a modern event management enterprise.
* **Visual Styling Decisions:**
  * Background colors set to elegant dark colors (`#0b0c10`, `#07080a`).
  * Glassmorphism panels featuring `backdrop-filter: blur(...)` and clean translucent borders.
  * Micro-animations for card hovers and page fade-ins.
  * Consistent font families (`Outfit` for high-impact headings and `Inter` for layout readability).
  * Color coding: Green (Active/Reliable), Orange/Yellow (Warning/Monitor), and Red (Blacklisted/Suspended).

## 💻 Phase 3: Frontend Development
* **Single Page Application Shell:** Scaffolded React + Vite project structure.
* **Routes & Navigation Setup:** Configured React Router routes for:
  * `/login`
  * `/dashboard`
  * `/vendors`, `/vendors/new`, `/vendors/:id`, `/vendors/:id/edit`
  * `/ratings/new`
  * `/blacklist`
  * `/recommendations`
  * `/reports`
  * `/settings`
* **Reusable Element Assembly:** Built reusable component libraries:
  * Collapsible navigation `Sidebar` and role-display `Topbar`.
  * KPI `StatCards`, progress indicators, and badge models.
  * Alert notification `Toasts` and danger validation `ConfirmModals`.

## ⚙️ Phase 4: Backend API Development
* **REST Server Architecture:** Established Express app listening on port `5000` with CORS permissions enabled.
* **Structured Routing Controllers:**
  * `vendorRoutes.js`: Listing, search, CRUD, and status override controllers.
  * `ratingRoutes.js`: Submissions and historical queries.
  * `dashboardRoutes.js`: Aggregate calculations and charts data.
  * `blacklistRoutes.js`: Risk listing filter.
  * `recommendationRoutes.js`: Search wizards query.
  * `reportRoutes.js`: Detailed reports and export compilation.
  * `settingsRoutes.js`: Scoring weight configuration variables.

## 🗄️ Phase 5: Database Design
* **Relational Schema (Prisma/SQLite):**
  * `Vendor`: Maps supplier contacts, locations, total events served, scores, standing status, and risk level.
  * `Rating`: Granular scoring attributes, would-rebook feedback, event date/type/venue, and issues checklist strings.
  * `StatusHistory`: Records standing transition histories.
  * `Setting`: Stores dynamic scoring weights and thresholds.
* **Database Seeding (`seed.js`):** Scripted auto-seeding engine pre-populating database with 12 vendors and 20 ratings logs.

## 🧮 Phase 6: Rating and Blacklist Logic
* ** Granular Weighting Calculation Engine (`scoreCalculator.js`):**
  $$\text{Final Score} = \text{Punctuality} \times 0.25 + \text{Quality} \times 0.25 + \text{Professionalism} \times 0.20 + \text{CostBehavior} \times 0.15 + \text{Communication} \times 0.15$$
* **Auto-Standings Rules Engine:**
  * *Blacklisted:* Score < 2.5 OR history includes both "Last-minute cancellation" and "Client complaint".
  * *Warning:* Score between 2.5 and 3.2, OR severe issues count $\ge$ 2, OR rebook status "No" $\ge$ 3 times.
  * *Active:* Score $\ge$ 3.2 (with "Low" risk for score $\ge$ 4.0, or "Medium" risk for score $\ge$ 3.2).
  * *Status Change Audits:* Saves transitions in `StatusHistory` automatically.

## 📊 Phase 7: Dashboard and Reports
* **Dashboard Overview:** Displays KPI card values, recent events tables, risk logs, and 3 Recharts analytics panels.
* **Recommendations Wizard:** Dynamic matching query that rates active vendors and ranks candidates.
* **Auditing Reports & Exporter:** Interactive datatables with front-end Blob converters downloading `.csv` sheets.

## 🧪 Phase 8: Testing
* **Manual Verification:** Checked form inputs, validation checks, pagination, and layout responsiveness.
* **Integration Tests (`testScoring.js`):** Automated database connection script simulating review submissions and asserting standing rules.

## 🌐 Phase 9: Deployment
* **Decoupled Deployment Readiness:** Built decoupled architecture separating React client build assets from Express backend routes.
* **Database Portability:** Configured Prisma mapping schemas to SQLite files for local review, enabling quick transitions to PostgreSQL.

## 🎓 Phase 10: Final Review Preparation
* **Documentation Compilation:** Generated `README.md`, `testing-checklist.md`, and `review-presentation-points.md`.
* **Verification Checks:** Verified client build outputs to confirm zero console warnings or route exceptions.
