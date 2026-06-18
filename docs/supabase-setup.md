# Supabase Database Setup & Deployment Guide

This document provides step-by-step instructions to set up your PostgreSQL database on Supabase.com, connect the backend application, and deploy both the frontend and backend.

---

## 🗄️ Part 1: Supabase Database Setup

Follow these steps to initialize your database on Supabase:

1. **Sign Up / Log In**: Go to [supabase.com](https://supabase.com) and sign up with GitHub or your email.
2. **Create a New Project**:
   * Click **New Project**.
   * Select an Organization, choose a project name (e.g., `vendor-performance`), and set a secure **Database Password** (keep this password safe).
   * Choose the geographical region closest to your users.
   * Select the **Free Plan** tier.
   * Click **Create new project** and wait a few minutes for the database to provision.
3. **Open the SQL Editor**:
   * On the left sidebar menu in the Supabase dashboard, click the **SQL Editor** icon (a terminal `>_` symbol).
   * Click **New query** (or **Quick start** -> **Blank query**).
4. **Run the Initialization Script**:
   * Copy the complete SQL script below and paste it into the editor.
   * Click the **Run** button (or press `Cmd + Enter` / `Ctrl + Enter`).
   * Confirm that the query runs successfully with the message `Success. No rows returned.` or similar.

---

## 📝 SQL Initialization & Seeding Script

Copy and run the following script in the Supabase SQL Editor:

```sql
-- 1. Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS "StatusHistory" CASCADE;
DROP TABLE IF EXISTS "Rating" CASCADE;
DROP TABLE IF EXISTS "Vendor" CASCADE;
DROP TABLE IF EXISTS "Setting" CASCADE;

-- 2. Create Table: Vendor
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "businessId" TEXT,
    "notes" TEXT,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "scorePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "riskLevel" TEXT NOT NULL DEFAULT 'Low',
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "noRebookCount" INTEGER NOT NULL DEFAULT 0,
    "severeIssueCount" INTEGER NOT NULL DEFAULT 0,
    "blacklistReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- 3. Create Table: Rating
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "ratedBy" TEXT NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "quality" INTEGER NOT NULL,
    "professionalism" INTEGER NOT NULL,
    "costBehavior" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "scorePercentage" DOUBLE PRECISION NOT NULL,
    "wouldRebook" BOOLEAN NOT NULL,
    "issues" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Rating_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Create Table: StatusHistory
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "oldStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StatusHistory_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Create Table: Setting
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- 6. Seed Data: Settings
INSERT INTO "Setting" ("id", "value", "description", "updatedAt") VALUES
('blacklist_threshold', '2.5', 'Score below this threshold will blacklist the vendor (out of 5.0)', CURRENT_TIMESTAMP),
('warning_threshold', '3.2', 'Score below this threshold will warn the vendor (out of 5.0)', CURRENT_TIMESTAMP),
('weight_punctuality', '0.25', 'Weight for punctuality rating (0.0 to 1.0)', CURRENT_TIMESTAMP),
('weight_quality', '0.25', 'Weight for quality rating (0.0 to 1.0)', CURRENT_TIMESTAMP),
('weight_professionalism', '0.20', 'Weight for professionalism rating (0.0 to 1.0)', CURRENT_TIMESTAMP),
('weight_cost_behavior', '0.15', 'Weight for cost behavior rating (0.0 to 1.0)', CURRENT_TIMESTAMP),
('weight_communication', '0.15', 'Weight for communication rating (0.0 to 1.0)', CURRENT_TIMESTAMP);

-- 7. Seed Data: Vendors
INSERT INTO "Vendor" ("id", "name", "category", "contactPerson", "phone", "email", "location", "businessId", "notes", "averageScore", "scorePercentage", "status", "riskLevel", "totalEvents", "noRebookCount", "severeIssueCount", "blacklistReason", "createdAt", "updatedAt") VALUES
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0001', 'Royal Feast Catering', 'Caterer', 'Rajesh Sharma', '+91 98765 43210', 'info@royalfeast.com', 'Bangalore', 'GSTIN29ROYFE1234F', 'Primary catering partner. High quality, premium presentation.', 4.8, 96.0, 'Active', 'Low', 2, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0002', 'DecoCraft Events', 'Decorator', 'Priya Nair', '+91 98765 43211', 'contact@decocraft.in', 'Bangalore', 'GSTIN29DECO1234D', 'Specializes in floral design and large-scale stage setups.', 4.55, 91.0, 'Active', 'Low', 2, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0003', 'Golden Lens Photography', 'Photographer', 'Amit Patel', '+91 98765 43212', 'amit@goldenlens.com', 'Mumbai', NULL, 'Experienced candid photographer.', 4.23, 84.5, 'Active', 'Low', 2, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0004', 'Beat Drop Sound & DJ', 'Sound & DJ', 'DJ Vicky', '+91 98765 43213', 'vicky@beatdropsound.com', 'Bangalore', NULL, 'Popular for corporate parties and sangeet functions.', 2.83, 56.5, 'Warning', 'Medium', 2, 1, 1, 'Average performance score (2.83) is in warning range (< 3.2).', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0005', 'Grand Plaza Ballroom', 'Venue Partner', 'Siddharth Goel', '+91 98765 43214', 'events@grandplaza.com', 'Delhi', 'GSTIN07GRPL5678G', '5-star luxury banquet and lawn space.', 4.73, 94.5, 'Active', 'Low', 2, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0006', 'Flora Elegance', 'Florist', 'Meera Sen', '+91 98765 43215', 'meera@floraelegance.com', 'Bangalore', NULL, 'Provides premium exotic flowers.', 3.78, 75.5, 'Active', 'Medium', 2, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0007', 'Swift Logistics Solutions', 'Logistics', 'Karan Singh', '+91 98765 43216', 'karan@swiftlogistics.com', 'Chennai', 'GSTIN33SWLO9012S', 'Handles heavy equipment moving and stage transport.', 2.8, 56.0, 'Warning', 'Medium', 2, 1, 0, 'Average performance score (2.8) is in warning range (< 3.2).', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0008', 'Sparkle & Shine Lighting', 'Lighting', 'Rohan Mehta', '+91 98765 43217', 'rohan@sparkleshine.com', 'Bangalore', NULL, 'Intelligent lights, lasers, and cold-fire pyros.', 4.23, 84.5, 'Active', 'Low', 2, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0009', 'Vivid Frame Videography', 'Videographer', 'Srinivas Rao', '+91 98765 43218', 'srinivas@vividframe.in', 'Hyderabad', NULL, 'Teaser edits and cinematic wedding films.', 4.0, 80.0, 'Active', 'Low', 1, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0010', 'Glamour Brush Makeup Studio', 'Makeup Artist', 'Neha Kapoor', '+91 98765 43219', 'neha@glamourbrush.com', 'Bangalore', NULL, 'Highly rated bridal makeup artist.', 4.85, 97.0, 'Active', 'Low', 1, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0011', 'Direct Transport Group', 'Transport', 'Baldev Singh', '+91 98765 43220', 'baldev@directtransport.in', 'Bangalore', 'GSTIN29DITR4321B', 'Local mini trucks and loader vehicles.', 1.75, 35.0, 'Blacklisted', 'High', 2, 2, 1, 'Average performance score (1.75) fell below the blacklist threshold of 2.5.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0012', 'Elite Security & Staffing', 'Other', 'Vikram Rathore', '+91 98765 43221', 'vikram@elitesecurity.com', 'Bangalore', 'GSTIN29ELSE6543E', 'Bouncers, hostesses, and valet staff.', 4.45, 89.0, 'Active', 'Low', 1, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. Seed Data: Ratings
INSERT INTO "Rating" ("id", "vendorId", "eventName", "eventDate", "eventType", "clientName", "venue", "ratedBy", "punctuality", "quality", "professionalism", "costBehavior", "communication", "finalScore", "scorePercentage", "wouldRebook", "issues", "feedback", "adminNotes", "createdAt") VALUES
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0101', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0001', 'Grand Royal Wedding', '2026-05-10 12:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 5, 5, 5, 5, 5, 5.0, 100.0, true, '', 'Superb food quality and on-time service. Guests loved the live counters!', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0102', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0001', 'TechCorp Annual Meet', '2026-06-01 18:00:00', 'Corporate Event', 'TechCorp Inc.', 'Lalit Pavilion', 'John (Coordinator)', 5, 4, 5, 4, 5, 4.6, 92.0, true, '', 'Very professional setup. Punctual and cooperative team.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0103', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0002', 'Grand Royal Wedding', '2026-05-10 12:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 4, 5, 5, 4, 4, 4.45, 89.0, true, '', 'Beautiful decor decoration. Slight delay in final finish but quality made up for it.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0104', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0002', 'Silver Jubilee Anniversary', '2026-05-20 17:00:00', 'Engagement', 'Mathur Family', 'Whitefield Banquet', 'Riya (Planner)', 5, 5, 4, 4, 5, 4.65, 93.0, true, '', 'Stunning entrance arch. Work finished 1 hour before scheduled time.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0105', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0003', 'Grand Royal Wedding', '2026-05-10 12:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 4, 4, 4, 4, 4, 4.0, 80.0, true, '', 'Delivered great pictures. Took slightly longer for edit delivery but output was clean.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0106', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0003', 'Pre-Wedding Shoot', '2026-04-15 08:00:00', 'Engagement', 'Amit & Pooja', 'Nandi Hills', 'Vikas (Planner)', 5, 4, 5, 3, 5, 4.45, 89.0, true, '', 'Very creative director, nice drone shots. Budget was slightly on the higher side.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0107', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0004', 'TechCorp Afterparty', '2026-06-01 20:00:00', 'Corporate Event', 'TechCorp Inc.', 'Lalit Pavilion', 'John (Coordinator)', 3, 4, 3, 3, 3, 3.25, 65.0, true, 'Poor communication', 'Decent DJing, but communication before the event was very poor. Slow responses.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0108', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0004', 'Sangeet Night', '2026-05-18 19:00:00', 'Wedding', 'Gupta Family', 'Jayamahal Palace', 'Riya (Planner)', 2, 3, 2, 3, 2, 2.4, 48.0, false, 'Late arrival, Rude behavior', 'Arrived 1 hour late for sound check. DJ had an argument with the bride''s brother.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0109', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0005', 'Grand Royal Wedding', '2026-05-10 12:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 5, 5, 5, 4, 5, 4.85, 97.0, true, '', 'Venue was clean, AC was working perfectly. Helpful management.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0110', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0005', 'Vanguard Corporate Gala', '2026-05-25 18:00:00', 'Corporate Event', 'Vanguard Ltd', 'Grand Plaza Ballroom', 'John (Coordinator)', 5, 4, 5, 5, 4, 4.6, 92.0, true, '', 'Smooth event execution. Valet parking was managed efficiently.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0111', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0006', 'Grand Royal Wedding', '2026-05-10 12:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 4, 4, 4, 4, 4, 4.0, 80.0, true, '', 'Flowers were fresh. Stage look matched the reference image.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0112', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0006', 'Birthday Bash', '2026-05-28 16:00:00', 'Birthday', 'Kapoor Family', 'Home Lawn', 'Vikas (Planner)', 3, 4, 3, 4, 4, 3.55, 71.0, true, '', 'Good work, but arrived slightly late. Flowers were clean and well-arranged.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0113', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0007', 'Grand Royal Wedding', '2026-05-10 08:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 2, 4, 3, 3, 2, 2.85, 57.0, false, 'Late arrival, Poor communication', 'Truck arrived 2 hours late. Caused delays in set construction. Poor updates during transit.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0114', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0007', 'Product Launch Logistics', '2026-05-22 06:00:00', 'Corporate Event', 'Innovate Corp', 'BIEC Center', 'John (Coordinator)', 2, 3, 3, 3, 3, 2.75, 55.0, true, 'Late arrival', 'Again delayed arrival. Managed to load quickly but need a more reliable timing schedule.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0115', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0008', 'Grand Royal Wedding', '2026-05-10 18:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 4, 4, 5, 4, 4, 4.2, 84.0, true, '', 'Setup was gorgeous. LED walls worked flawlessly.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0116', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0008', 'Rock Concert Night', '2026-05-30 19:00:00', 'Cultural Event', 'Youth Club', 'Palace Grounds', 'Vikas (Planner)', 5, 4, 4, 4, 4, 4.25, 85.0, true, '', 'Impressive lighting execution. Quick setup and pack-up.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0117', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0009', 'Grand Royal Wedding', '2026-05-10 12:00:00', 'Wedding', 'Sharma Family', 'Grand Plaza Ballroom', 'Riya (Planner)', 4, 4, 4, 4, 4, 4.0, 80.0, true, '', 'Videography was beautiful. Teaser video was delivered within 7 days.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0118', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0010', 'Grand Royal Wedding Bridal', '2026-05-10 10:00:00', 'Wedding', 'Sharma Family (Bride)', 'Grand Plaza Ballroom', 'Riya (Planner)', 5, 5, 5, 4, 5, 4.85, 97.0, true, '', 'Bride looked spectacular. Extremely professional and calm artist.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0119', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0011', 'Corporate Expo Setup', '2026-04-10 07:00:00', 'Corporate Event', 'Expo Ltd', 'BIEC Center', 'John (Coordinator)', 3, 2, 2, 2, 2, 2.25, 45.0, false, 'Poor communication, Rude behavior', 'Drivers were rude. Refused to park in designated loading bays. Delay in unload.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0120', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0011', 'Royal Sangeet Logistics', '2026-05-15 10:00:00', 'Wedding', 'Gupta Family', 'Jayamahal Palace', 'Riya (Planner)', 1, 2, 1, 1, 1, 1.25, 25.0, false, 'Last-minute cancellation, Client complaint', 'Cancelled 1 truck just 3 hours before dispatch! Caused panic and client was extremely upset. Unacceptable behavior.', NULL, CURRENT_TIMESTAMP),
('d3b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0121', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0012', 'TechCorp Annual Gala', '2026-06-01 17:00:00', 'Corporate Event', 'TechCorp Inc.', 'Lalit Pavilion', 'John (Coordinator)', 5, 4, 5, 4, 4, 4.45, 89.0, true, '', 'Valet and guards were well-groomed, polite, and handled crowd professionally.', NULL, CURRENT_TIMESTAMP);

-- 9. Seed Data: StatusHistory
INSERT INTO "StatusHistory" ("id", "vendorId", "oldStatus", "newStatus", "reason", "changedBy", "createdAt") VALUES
('a1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0201', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0004', 'Active', 'Warning', 'Average performance score (2.83) is in warning range.', 'System Setup', CURRENT_TIMESTAMP),
('a1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0202', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0007', 'Active', 'Warning', 'Average performance score (2.8) is in warning range.', 'System Setup', CURRENT_TIMESTAMP),
('a1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0203', 'e1b0c8b0-8f9d-4c3e-8c5e-8b1e0f0a0011', 'Active', 'Blacklisted', 'Average performance score (1.75) fell below the blacklist threshold of 2.5.', 'System Setup', CURRENT_TIMESTAMP);
```

---

## 🔗 Part 2: Connect Supabase to the Express Backend

Once the SQL script has executed successfully:

1. **Obtain Connection Strings**:
   * Go to **Project Settings** (the gear icon at the bottom of the left sidebar).
   * Click **Database**.
   * Scroll down to the **Connection string** section.
   * Under the **URI** tab, copy the connection string. It will look like:
     `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require`
   * Under the **Transaction** or **Session** mode, note down your transaction pooled connection string (used for `DATABASE_URL`) and direct connection string (used for `DIRECT_URL`).
2. **Update the Backend `.env`**:
   * Open the `.env` file in your `backend` directory.
   * Replace the database connection parameters as follows:
     ```env
     # Connection Pooler URL (Used for Prisma client queries)
     DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

     # Direct Connection URL (Used for Prisma migrations and schema changes)
     DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

     PORT=5000
     FRONTEND_URL="http://localhost:5173"
     ```
   * *Replace `[YOUR-PROJECT-REF]` with your actual project reference and `[YOUR-PASSWORD]` with the password you set during project creation.*
3. **Regenerate Prisma Client**:
   * Open a terminal inside the `/backend` directory and run:
     ```bash
     npm install
     npx prisma generate
     ```

---

## 🚀 Part 3: Deploying the Application

Here are the step-by-step instructions to deploy both the backend and frontend to hosting platforms.

### 🌐 Option A: Deploying Backend to Render.com

Render is a straightforward hosting provider for Node.js servers:

1. **Upload your code to GitHub**: Create a repository and push the codebase there.
2. **Sign up at Render**: Go to [render.com](https://render.com) and log in with your GitHub account.
3. **Create a Web Service**:
   * Click **New +** and select **Web Service**.
   * Connect your GitHub repository.
   * Configure the service parameters:
     * **Name**: `vendor-performance-backend`
     * **Region**: Choose a region close to your Supabase server database region.
     * **Branch**: `main` (or your active branch)
     * **Root Directory**: `backend`
     * **Runtime**: `Node`
     * **Build Command**: `npm install`
     * **Start Command**: `npm start`
4. **Environment Variables**:
   * Click the **Advanced** drop-down.
   * Add the following Environment Variables:
     * `DATABASE_URL` = *(Your Supabase Connection Pooling URI copied in Part 2)*
     * `DIRECT_URL` = *(Your Supabase Direct Connection URI copied in Part 2)*
     * `PORT` = `10000` (Render allocates this automatically or defaults to this)
     * `FRONTEND_URL` = *(URL of your deployed React frontend - you will update this after deploying frontend)*
5. **Deploy**: Click **Create Web Service**. Wait for the logs to say `Web service is running`. Note the URL of the service (e.g., `https://vendor-performance-backend.onrender.com`).

---

### 💻 Option B: Deploying Frontend to Vercel

Vercel is optimized for frontend applications built with Vite:

1. **Sign up at Vercel**: Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. **Create New Project**:
   * Click **Add New** -> **Project**.
   * Import your GitHub repository containing the code.
3. **Configure Project Settings**:
   * **Framework Preset**: `Vite` (Vercel automatically detects this).
   * **Root Directory**: Select `frontend`.
   * **Build and Output Settings**: Defaults are correct (`npm run build`).
4. **Environment Variables**:
   * Add a new environment variable:
     * `VITE_API_URL` = `https://vendor-performance-backend.onrender.com/api` (Replace this with your actual Render backend URL followed by `/api`).
5. **Deploy**:
   * Click **Deploy**. Vercel will build the frontend assets.
   * Once completed, Vercel will provide your live URL (e.g., `https://vendor-performance.vercel.app`).

### 🔄 Step 4: Final Link-up

Now that the frontend is deployed:
1. Go back to your Render backend web service dashboard.
2. Click **Environment**.
3. Update `FRONTEND_URL` with your Vercel URL (e.g., `https://vendor-performance.vercel.app`).
4. Save changes. Render will automatically re-deploy the backend with the updated CORS policy, allowing the frontend to successfully talk to your API!
