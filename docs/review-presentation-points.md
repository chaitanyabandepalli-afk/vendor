# Internship Review Presentation Points

This document provides a slide-by-slide structure and speaking points split between three team members (students) for Review 2 and Review 3 of the internship project presentation.

---

## 👥 Student 1: Frontend & UI/UX Design

**Responsibility:** Frontend Layouts, Dashboard Analytics, Vendor Directories, Interactive Forms, and Responsive Design.

### 1. Project Overview & UI Architecture
* **SaaS Design System:** Built a modern, dark-themed event-management interface using HSL-tailored colors, glassmorphism card panels (`backdrop-filter`), and customized CSS transitions.
* **Component-Driven Design:** Developed clean, reusable elements including:
  * Collapsible desktop and mobile `Sidebar` navigation.
  * Context-aware Page `Topbar` showing user roles.
  * Color-coded `StatusBadges` and `ScoreBadges`.
  * Customized `ConfirmModal` overlays and automated notification `Toasts`.

### 2. Dashboard Analytics & Charts
* **KPI Metric Grid:** Highlighting total suppliers, average system score index, warning status monitors, and active blacklisted vendors.
* **Interactive Charting (Recharts):**
  * *Score Distribution:* Pie chart separating vendors into score bands.
  * *Category Averages:* Vertical bar chart mapping vendor scores by event type category.
  * *Monthly Timeline:* Area chart mapping evaluation review traffic over time.

### 3. Directories & Forms
* **Vendor Directory:** Data tables featuring debounced search inputs, category dropdown filters, score headers sorting, and paging.
* **Post-Event Rating Wizard:** Range sliders (1 to 5) for evaluation metrics (Punctuality, Quality, Professionalism, Cost, Communication) and dynamic checkbox grids for identifying service issues.

---

## 👥 Student 2: Backend Architecture & Score Calculation

**Responsibility:** Express REST APIs, Prisma ORM, SQLite DB Schema, Autoscoring Math, and Database Seeding.

### 1. REST API Routing & Controllers
* **Server Setup:** Configured standard Node.js Express server with CORS headers, JSON parsers, and centralized try-catch exception handling.
* **API Endpoints:**
  * `/api/vendors`: CRUD operations and manual standing overrides.
  * `/api/ratings`: Submissions and historical logs.
  * `/api/blacklist`: Risk filtration dashboard.
  * `/api/recommendations`: Multi-metric ranking query.

### 2. Database Design & Seeding
* **Relational Schema (Prisma/SQLite):** Defined models for `Vendor`, `Rating`, `StatusHistory`, and `Setting` to maintain relational integrity and support quick migrations to enterprise databases like PostgreSQL.
* **Seeding Engine:** Populated database with 12 vendors and 20 ratings logs.

### 3. Autoscoring & Status Calculation Logic
* **Granular Scoring Formula:**
  $$\text{Final Score} = \text{Punctuality} \times 0.25 + \text{Quality} \times 0.25 + \text{Professionalism} \times 0.20 + \text{CostBehavior} \times 0.15 + \text{Communication} \times 0.15$$
* **Auto-Standing Classification Rules:**
  * *Active:* Score $\ge$ 3.2.
  * *Warning:* Score between 2.5 and 3.2, OR severe issues count $\ge$ 2, OR rebook standing "No" $\ge$ 3 times.
  * *Blacklisted:* Score < 2.5, OR concurrent occurrence of a "Last-minute cancellation" and "Client complaint".

---

## 👥 Student 3: QA Testing, Verification, & Deployment

**Responsibility:** Testing Checklist, Scoring Verification, Overrides Review, Reports Page, CSV Exports, and Deployment.

### 1. Quality Assurance & Testing
* **Checklist Coverage:** Executed test cases for login, vendor CRUD, score calculation, status overrides, and responsive layout scaling.
* **Automated Unit Checks (`testScoring.js`):** Scripted database integration tests to programmatically assert calculations, warning triggers, and blacklist conditions.

### 2. Blacklist Management & Manual Standings
* **Security & Overrides:** Built manual override systems allowing administrators to bypass automated ratings calculations and restore or block suppliers, logging details in `StatusHistory`.

### 3. Analytics Reports & CSV Exports
* **Reporting Modules:** Compiled performance summaries, category breakdowns, and ratings logs.
* **Client-Side CSV Exporter:** Constructed Blob compilers allowing users to download data tables into spreadsheets.

### 4. Setup, Deployment, & Documentation
* **Configuration Controls:** Maintained clean documentation (`README.md`, `testing-checklist.md`, `implementation-plan.md`) to support deployment setup.
