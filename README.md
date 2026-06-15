# Vendor Performance Rating & Blacklist System

**Company:** SLV Events  
**Project Title:** Full-Stack Vendor Performance Rating & Blacklist System  
**Objective:** Build a premium SaaS-style event vendor management platform. Tracks supplier quality indexes, calculates automated scores, raises warning flags, manages blacklists, generates reports, and recommends top-performing suppliers for upcoming events.

---

## 🚀 Features

1. **Role-Based Demo Authentication:** Login simulation for Admin, Event Planner, Vendor Coordinator, Finance Team, and Operations Lead.
2. **KPI Analytical Dashboard:** Grids displaying total vendors, average system scores, warning counters, and active rating alerts. Integrates interactive Recharts tracking category averages, score distributions, and activity timelines.
3. **Interactive Directories:** Structured vendor directory tables with multi-field search inputs, category dropdown filtering, status categorizations, and sorting.
4. **Performance Rating System:** Slider scoring inputs and checklist triggers for tracking service issues (e.g., cancellations, damages).
5. **Autoscoring Rules Engine:**
   * **Active / Reliable:** Score $\ge$ 4.0 (Low Risk)
   * **Active / Monitor:** Score $\ge$ 3.2 and < 4.0 (Medium Risk)
   * **Warning / Probation:** Score $\ge$ 2.5 and < 3.2 OR Severe Issue Count $\ge$ 2 OR "Would Not Rebook" Count $\ge$ 3 (Medium Risk)
   * **Blacklisted / Suspended:** Score < 2.5 OR history includes both a "Last-minute cancellation" and "Client complaint" (High Risk)
6. **Risk Management Standings & Overrides:** Dedicated audit logs for manual operator overrides.
7. **Rule-Based Recommendations:** Search wizards prioritizing high-score, low-risk active vendors for upcoming event bookings.
8. **Exportable CSV Reports:** Local CSV downloads for vendor performance reviews, category indicators, and event ratings.
9. **Dynamic Formula Configurations:** Sliders to adjust scoring weights and status thresholds.

---

## 🛠️ Tech Stack

* **Frontend:** React + Vite, Tailwind CSS, React Router, Axios, Lucide React, Recharts.
* **Backend:** Node.js, Express.js, Prisma ORM, SQLite database.

---

## 📁 Folder Structure

```
vender-performance/
├── docs/
│   ├── implementation-plan.md
│   └── testing-checklist.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── dev.db
│   ├── src/
│   │   ├── routes/
│   │   │   ├── vendorRoutes.js
│   │   │   ├── ratingRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── blacklistRoutes.js
│   │   │   ├── recommendationRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── settingsRoutes.js
│   │   ├── services/
│   │   │   └── scoreCalculator.js
│   │   ├── testScoring.js
│   │   └── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── ScoreBadge.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── VendorList.jsx
│   │   │   ├── VendorForm.jsx
│   │   │   ├── VendorDetail.jsx
│   │   │   ├── RatingForm.jsx
│   │   │   ├── BlacklistManagement.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

---

## 🔌 API Endpoints

### Vendors
* `GET /api/vendors` - List all vendors with optional filters.
* `GET /api/vendors/:id` - Fetch detailed vendor profile, ratings, and status history.
* `POST /api/vendors` - Onboard new vendor.
* `PUT /api/vendors/:id` - Modify vendor profile.
* `DELETE /api/vendors/:id` - Delete vendor.
* `PUT /api/vendors/:id/status` - Override vendor standing and update `StatusHistory`.

### Ratings
* `GET /api/ratings` - Fetch all event ratings.
* `GET /api/ratings/:id` - Fetch a single rating detail.
* `POST /api/ratings` - Submit post-event vendor rating and trigger recalculation.
* `GET /api/ratings/vendor/:vendorId` - Fetch ratings for a specific vendor.

### Dashboard & Analytics
* `GET /api/dashboard/summary` - Aggregates KPI numbers and chart datasets.
* `GET /api/blacklist` - Retrieves warning-flagged and blacklisted vendors.
* `GET /api/recommendations` - Finds optimal active suppliers based on criteria.
* `GET /api/reports/vendor-summary` - Performance summary.
* `GET /api/reports/category-performance` - Average scores by category.
* `GET /api/reports/event-ratings` - Ratings list formatted for spreadsheets.
* `GET /api/settings` - Fetch formula configurations.
* `PUT /api/settings` - Save weights/thresholds.

---

## 🧮 Scoring Logic

### Granular Weighting Formula
$$Final Score = Punctuality \times W_p + Quality \times W_q + Professionalism \times W_{pr} + CostBehavior \times W_{cb} + Communication \times W_c$$

*Where default weights are:*
* $W_p = 0.25$
* $W_q = 0.25$
* $W_{pr} = 0.20$
* $W_{cb} = 0.15$
* $W_c = 0.15$

$$Score Percentage = \frac{Final Score}{5.0} \times 100$$

---

## 🛠️ Setup & Running

### Prerequisites
* Node.js ($\ge$ v18.0)
* npm ($\ge$ v9.0)

### 1. Database Setup & Seed (Backend)
Navigate to the `backend` folder, install dependencies, run migrations, and seed:
```bash
cd backend
npm install
npm run db:setup
```
*This command runs migrations and seeds the SQLite database with 12 vendors, 20 ratings, and dynamic settings.*

### 2. Run Backend Server
Start the development server:
```bash
npm run dev
```
The server will start running on [http://localhost:5000](http://localhost:5000).

### 3. Run Backend Engine Tests
Run automated unit checks:
```bash
node src/testScoring.js
```

### 4. Run Frontend App
Navigate to the `frontend` folder, install dependencies, and start Vite:
```bash
cd ../frontend
npm install
npm run dev
```
The application will launch on [http://localhost:5173](http://localhost:5173).

---

## 🔮 Future Scope

1. **Authentication:** Implement JWT auth with Passport or Firebase.
2. **Cloud Database:** Scale from local SQLite to PostgreSQL (easily done by modifying the Prisma adapter provider).
3. **Advanced Reports:** Export to native PDF invoices or spreadsheets directly from the server.
4. **Geo-Location Search:** Suggest nearest suppliers using Google Maps API.
5. **Contract Management:** Upload and review contract PDFs.
