# Testing Checklist

This document details the quality assurance testing checklist and verification scenarios for the **Vendor Performance Rating & Blacklist System**.

---

## 🧪 Core Test Cases

### 1. Login Test
- [x] **Verification Check:** Enter email, password, select a staff role from the dropdown, and submit.
- [x] **Expected Result:** Saves user session in `localStorage`, redirects to `/dashboard`, and displays active role in Sidebar and Topbar.

### 2. Add Vendor Test
- [x] **Verification Check:** Open add vendor form, input empty details, verify validators, complete fields, and submit.
- [x] **Expected Result:** Creates vendor record in SQLite, shows success toast, and lists vendor in directory.

### 3. Edit Vendor Test
- [x] **Verification Check:** Click edit icon on a vendor, change contact person or location, and save.
- [x] **Expected Result:** Modifies database details, redirects to directory, and updates table rows.

### 4. Delete Vendor Test
- [x] **Verification Check:** Click delete icon on a vendor, verify safety warning ConfirmModal, and confirm.
- [x] **Expected Result:** Cascade deletes vendor and rating histories from database, and removes row from UI.

### 5. Submit Rating Test
- [x] **Verification Check:** Open rate vendor form, select vendor, complete client details, input metrics, and submit.
- [x] **Expected Result:** Records rating in database, calculates score, recalculates vendor average score, and redirects to profile page showing history.

### 6. Score Calculation Test
- [x] **Verification Check:** Submit rating with scores: Punctuality=5, Quality=5, Professionalism=5, Cost=5, Communication=5.
- [x] **Expected Result:** Formula `5*0.25 + 5*0.25 + 5*0.20 + 5*0.15 + 5*0.15` evaluates to exactly `5.0` (100%).

### 7. Warning Vendor Test
- [x] **Verification Check:** Submit ratings that result in an average score between `2.5` and `3.2`, OR check 2 severe issues, OR submit `Would rebook = No` for 3 events.
- [x] **Expected Result:** Vendor status automatically transitions to `Warning` with risk level set to `Medium`, and logs history to `StatusHistory`.

### 8. Blacklist Vendor Test
- [x] **Verification Check:** Submit rating with score below `2.5`, OR check both `Last-minute cancellation` and `Client complaint`.
- [x] **Expected Result:** Vendor status transitions to `Blacklisted` with risk level set to `High`, records blacklist reason, and blocks vendor from recommendations.

### 9. Recommendation Test
- [x] **Verification Check:** Select category and minimum score, and search.
- [x] **Expected Result:** Renders recommended active suppliers ranked by custom reliability index. Blacklisted vendors are excluded.

### 10. Dashboard Stats Test
- [x] **Verification Check:** View dashboard KPIs and Recharts widgets.
- [x] **Expected Result:** Accurately reflects database aggregates for total vendors, average scores, warning counts, and recently rated events.

### 11. Reports Test
- [x] **Verification Check:** View reports pages and export data.
- [x] **Expected Result:** Data tables render correctly. Clicking "Export CSV" generates and downloads `.csv` files for spreadsheets.

### 12. Responsive UI Test
- [x] **Verification Check:** Resize viewport to mobile (e.g., iPhone 12 Pro) and tablet dimensions.
- [x] **Expected Result:** Navigation Sidebar collapses, Topbar actions adjust, and dashboard charts grid reflows into a single column.
