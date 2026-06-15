import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = [
  { id: 'blacklist_threshold', value: '2.5', description: 'Score below this threshold will blacklist the vendor (out of 5.0)' },
  { id: 'warning_threshold', value: '3.2', description: 'Score below this threshold will warn the vendor (out of 5.0)' },
  { id: 'weight_punctuality', value: '0.25', description: 'Weight for punctuality rating (0.0 to 1.0)' },
  { id: 'weight_quality', value: '0.25', description: 'Weight for quality rating (0.0 to 1.0)' },
  { id: 'weight_professionalism', value: '0.20', description: 'Weight for professionalism rating (0.0 to 1.0)' },
  { id: 'weight_cost_behavior', value: '0.15', description: 'Weight for cost behavior rating (0.0 to 1.0)' },
  { id: 'weight_communication', value: '0.15', description: 'Weight for communication rating (0.0 to 1.0)' }
];

const VENDORS = [
  {
    name: "Royal Feast Catering",
    category: "Caterer",
    contactPerson: "Rajesh Sharma",
    phone: "+91 98765 43210",
    email: "info@royalfeast.com",
    location: "Bangalore",
    businessId: "GSTIN29ROYFE1234F",
    notes: "Primary catering partner. High quality, premium presentation.",
    status: "Active"
  },
  {
    name: "DecoCraft Events",
    category: "Decorator",
    contactPerson: "Priya Nair",
    phone: "+91 98765 43211",
    email: "contact@decocraft.in",
    location: "Bangalore",
    businessId: "GSTIN29DECO1234D",
    notes: "Specializes in floral design and large-scale stage setups.",
    status: "Active"
  },
  {
    name: "Golden Lens Photography",
    category: "Photographer",
    contactPerson: "Amit Patel",
    phone: "+91 98765 43212",
    email: "amit@goldenlens.com",
    location: "Mumbai",
    businessId: null,
    notes: "Experienced candid photographer.",
    status: "Active"
  },
  {
    name: "Beat Drop Sound & DJ",
    category: "Sound & DJ",
    contactPerson: "DJ Vicky",
    phone: "+91 98765 43213",
    email: "vicky@beatdropsound.com",
    location: "Bangalore",
    businessId: null,
    notes: "Popular for corporate parties and sangeet functions.",
    status: "Active"
  },
  {
    name: "Grand Plaza Ballroom",
    category: "Venue Partner",
    contactPerson: "Siddharth Goel",
    phone: "+91 98765 43214",
    email: "events@grandplaza.com",
    location: "Delhi",
    businessId: "GSTIN07GRPL5678G",
    notes: "5-star luxury banquet and lawn space.",
    status: "Active"
  },
  {
    name: "Flora Elegance",
    category: "Florist",
    contactPerson: "Meera Sen",
    phone: "+91 98765 43215",
    email: "meera@floraelegance.com",
    location: "Bangalore",
    businessId: null,
    notes: "Provides premium exotic flowers.",
    status: "Active"
  },
  {
    name: "Swift Logistics Solutions",
    category: "Logistics",
    contactPerson: "Karan Singh",
    phone: "+91 98765 43216",
    email: "karan@swiftlogistics.com",
    location: "Chennai",
    businessId: "GSTIN33SWLO9012S",
    notes: "Handles heavy equipment moving and stage transport.",
    status: "Active"
  },
  {
    name: "Sparkle & Shine Lighting",
    category: "Lighting",
    contactPerson: "Rohan Mehta",
    phone: "+91 98765 43217",
    email: "rohan@sparkleshine.com",
    location: "Bangalore",
    businessId: null,
    notes: "Intelligent lights, lasers, and cold-fire pyros.",
    status: "Active"
  },
  {
    name: "Vivid Frame Videography",
    category: "Videographer",
    contactPerson: "Srinivas Rao",
    phone: "+91 98765 43218",
    email: "srinivas@vividframe.in",
    location: "Hyderabad",
    businessId: null,
    notes: "Teaser edits and cinematic wedding films.",
    status: "Active"
  },
  {
    name: "Glamour Brush Makeup Studio",
    category: "Makeup Artist",
    contactPerson: "Neha Kapoor",
    phone: "+91 98765 43219",
    email: "neha@glamourbrush.com",
    location: "Bangalore",
    businessId: null,
    notes: "Highly rated bridal makeup artist.",
    status: "Active"
  },
  {
    name: "Direct Transport Group",
    category: "Transport",
    contactPerson: "Baldev Singh",
    phone: "+91 98765 43220",
    email: "baldev@directtransport.in",
    location: "Bangalore",
    businessId: "GSTIN29DITR4321B",
    notes: "Local mini trucks and loader vehicles.",
    status: "Active"
  },
  {
    name: "Elite Security & Staffing",
    category: "Other",
    contactPerson: "Vikram Rathore",
    phone: "+91 98765 43221",
    email: "vikram@elitesecurity.com",
    location: "Bangalore",
    businessId: "GSTIN29ELSE6543E",
    notes: "Bouncers, hostesses, and valet staff.",
    status: "Active"
  }
];

// Ratings configuration: [vendorIndex, eventName, date, eventType, client, venue, ratedBy, scores[5], wouldRebook, issues, feedback]
const RATINGS = [
  // Royal Feast Catering (index 0) - Excellent ratings
  [0, "Grand Royal Wedding", "2026-05-10T12:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [5, 5, 5, 5, 5], true, "", "Superb food quality and on-time service. Guests loved the live counters!"],
  [0, "TechCorp Annual Meet", "2026-06-01T18:00:00Z", "Corporate Event", "TechCorp Inc.", "Lalit Pavilion", "John (Coordinator)", [5, 4, 5, 4, 5], true, "", "Very professional setup. Punctual and cooperative team."],
  
  // DecoCraft Events (index 1) - High ratings
  [1, "Grand Royal Wedding", "2026-05-10T12:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [4, 5, 5, 4, 4], true, "", "Beautiful decor decoration. Slight delay in final finish but quality made up for it."],
  [1, "Silver Jubilee Anniversary", "2026-05-20T17:00:00Z", "Engagement", "Mathur Family", "Whitefield Banquet", "Riya (Planner)", [5, 5, 4, 4, 5], true, "", "Stunning entrance arch. Work finished 1 hour before scheduled time."],

  // Golden Lens Photography (index 2) - Good
  [2, "Grand Royal Wedding", "2026-05-10T12:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [4, 4, 4, 4, 4], true, "", "Delivered great pictures. Took slightly longer for edit delivery but output was clean."],
  [2, "Pre-Wedding Shoot", "2026-04-15T08:00:00Z", "Engagement", "Amit & Pooja", "Nandi Hills", "Vikas (Planner)", [5, 4, 5, 3, 5], true, "", "Very creative director, nice drone shots. Budget was slightly on the higher side."],

  // Beat Drop Sound & DJ (index 3) - Warning territory
  [3, "TechCorp Afterparty", "2026-06-01T20:00:00Z", "Corporate Event", "TechCorp Inc.", "Lalit Pavilion", "John (Coordinator)", [3, 4, 3, 3, 3], true, "Poor communication", "Decent DJing, but communication before the event was very poor. Slow responses."],
  [3, "Sangeet Night", "2026-05-18T19:00:00Z", "Wedding", "Gupta Family", "Jayamahal Palace", "Riya (Planner)", [2, 3, 2, 3, 2], false, "Late arrival, Rude behavior", "Arrived 1 hour late for sound check. DJ had an argument with the bride's brother."],

  // Grand Plaza Ballroom (index 4) - Excellent
  [4, "Grand Royal Wedding", "2026-05-10T12:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [5, 5, 5, 4, 5], true, "", "Venue was clean, AC was working perfectly. Helpful management."],
  [4, "Vanguard Corporate Gala", "2026-05-25T18:00:00Z", "Corporate Event", "Vanguard Ltd", "Grand Plaza Ballroom", "John (Coordinator)", [5, 4, 5, 5, 4], true, "", "Smooth event execution. Valet parking was managed efficiently."],

  // Flora Elegance (index 5) - Average
  [5, "Grand Royal Wedding", "2026-05-10T12:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [4, 4, 4, 4, 4], true, "", "Flowers were fresh. Stage look matched the reference image."],
  [5, "Birthday Bash", "2026-05-28T16:00:00Z", "Birthday", "Kapoor Family", "Home Lawn", "Vikas (Planner)", [3, 4, 3, 4, 4], true, "", "Good work, but arrived slightly late. Flowers were clean and well-arranged."],

  // Swift Logistics Solutions (index 6) - Warning (Late arrivals, score below warning threshold)
  [6, "Grand Royal Wedding", "2026-05-10T08:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [2, 4, 3, 3, 2], false, "Late arrival, Poor communication", "Truck arrived 2 hours late. Caused delays in set construction. Poor updates during transit."],
  [6, "Product Launch Logistics", "2026-05-22T06:00:00Z", "Corporate Event", "Innovate Corp", "BIEC Center", "John (Coordinator)", [2, 3, 3, 3, 3], true, "Late arrival", "Again delayed arrival. Managed to load quickly but need a more reliable timing schedule."],

  // Sparkle & Shine Lighting (index 7) - Good
  [7, "Grand Royal Wedding", "2026-05-10T18:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [4, 4, 5, 4, 4], true, "", "Setup was gorgeous. LED walls worked flawlessly."],
  [7, "Rock Concert Night", "2026-05-30T19:00:00Z", "Cultural Event", "Youth Club", "Palace Grounds", "Vikas (Planner)", [5, 4, 4, 4, 4], true, "", "Impressive lighting execution. Quick setup and pack-up."],

  // Vivid Frame Videography (index 8) - Good
  [8, "Grand Royal Wedding", "2026-05-10T12:00:00Z", "Wedding", "Sharma Family", "Grand Plaza Ballroom", "Riya (Planner)", [4, 4, 4, 4, 4], true, "", "Videography was beautiful. Teaser video was delivered within 7 days."],

  // Glamour Brush Makeup Studio (index 9) - Excellent
  [9, "Grand Royal Wedding Bridal", "2026-05-10T10:00:00Z", "Wedding", "Sharma Family (Bride)", "Grand Plaza Ballroom", "Riya (Planner)", [5, 5, 5, 4, 5], true, "", "Bride looked spectacular. Extremely professional and calm artist."],

  // Direct Transport Group (index 10) - Blacklisted (Scores below 2.5 + Cancellation/Complaints)
  [10, "Corporate Expo Setup", "2026-04-10T07:00:00Z", "Corporate Event", "Expo Ltd", "BIEC Center", "John (Coordinator)", [3, 2, 2, 2, 2], false, "Poor communication, Rude behavior", "Drivers were rude. Refused to park in designated loading bays. Delay in unload."],
  [10, "Royal Sangeet Logistics", "2026-05-15T10:00:00Z", "Wedding", "Gupta Family", "Jayamahal Palace", "Riya (Planner)", [1, 2, 1, 1, 1], false, "Last-minute cancellation, Client complaint", "Cancelled 1 truck just 3 hours before dispatch! Caused panic and client was extremely upset. Unacceptable behavior."],

  // Elite Security & Staffing (index 11) - Good
  [11, "TechCorp Annual Gala", "2026-06-01T17:00:00Z", "Corporate Event", "TechCorp Inc.", "Lalit Pavilion", "John (Coordinator)", [5, 4, 5, 4, 4], true, "", "Valet and guards were well-groomed, polite, and handled crowd professionally."]
];

async function main() {
  console.log("Cleaning database...");
  await prisma.statusHistory.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Seeding settings...");
  for (const s of DEFAULT_SETTINGS) {
    await prisma.setting.create({ data: s });
  }

  console.log("Seeding vendors...");
  const createdVendors = [];
  for (const v of VENDORS) {
    const vendor = await prisma.vendor.create({ data: v });
    createdVendors.push(vendor);
  }

  console.log("Seeding ratings...");
  for (const r of RATINGS) {
    const [vendorIdx, eventName, date, eventType, client, venue, ratedBy, scores, wouldRebook, issuesStr, feedback] = r;
    const vendor = createdVendors[vendorIdx];
    const [punctuality, quality, professionalism, costBehavior, communication] = scores;

    // Default scoring formula:
    // Final Score = punctuality * 0.25 + quality * 0.25 + professionalism * 0.20 + costBehavior * 0.15 + communication * 0.15
    const finalScore = punctuality * 0.25 + quality * 0.25 + professionalism * 0.20 + costBehavior * 0.15 + communication * 0.15;
    const scorePercentage = (finalScore / 5) * 100;

    await prisma.rating.create({
      data: {
        vendorId: vendor.id,
        eventName,
        eventDate: new Date(date),
        eventType,
        clientName: client,
        venue,
        ratedBy,
        punctuality,
        quality,
        professionalism,
        costBehavior,
        communication,
        finalScore: parseFloat(finalScore.toFixed(2)),
        scorePercentage: parseFloat(scorePercentage.toFixed(2)),
        wouldRebook,
        issues: issuesStr,
        feedback
      }
    });
  }

  console.log("Recalculating vendor statistics and updating statuses...");
  // Now recalculate for all vendors based on the ratings
  const allVendors = await prisma.vendor.findMany({ include: { ratings: true } });

  const weights = {
    blacklist_threshold: 2.5,
    warning_threshold: 3.2
  };

  const SEVERE_ISSUES = ["Last-minute cancellation", "Client complaint", "Damaged items", "Rude behavior"];

  for (const vendor of allVendors) {
    const ratings = vendor.ratings;
    const count = ratings.length;

    if (count === 0) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          averageScore: 0.0,
          scorePercentage: 0.0,
          totalEvents: 0,
          noRebookCount: 0,
          severeIssueCount: 0,
          status: "Active",
          riskLevel: "Low"
        }
      });
      continue;
    }

    let totalScoreSum = 0;
    let noRebookCount = 0;
    let severeIssueCount = 0;
    let hasCancellation = false;
    let hasComplaint = false;

    ratings.forEach(r => {
      totalScoreSum += r.finalScore;
      if (!r.wouldRebook) {
        noRebookCount++;
      }
      
      const ratingIssues = r.issues.split(',').map(s => s.trim()).filter(Boolean);
      ratingIssues.forEach(issue => {
        if (SEVERE_ISSUES.includes(issue)) {
          severeIssueCount++;
        }
        if (issue === "Last-minute cancellation") hasCancellation = true;
        if (issue === "Client complaint") hasComplaint = true;
      });
    });

    const averageScore = parseFloat((totalScoreSum / count).toFixed(2));
    const scorePercentage = parseFloat(((averageScore / 5.0) * 100).toFixed(2));

    // Determine status
    let status = "Active";
    let riskLevel = "Low";
    let blacklistReason = null;

    if (averageScore < weights.blacklist_threshold) {
      status = "Blacklisted";
      riskLevel = "High";
      blacklistReason = `Average performance score (${averageScore}) fell below the blacklist threshold of ${weights.blacklist_threshold}.`;
    } else if (hasCancellation && hasComplaint) {
      status = "Blacklisted";
      riskLevel = "High";
      blacklistReason = "Vendor flagged with both Last-minute cancellation and Client complaint in rating history.";
    } else if (averageScore >= weights.blacklist_threshold && averageScore < weights.warning_threshold) {
      status = "Warning";
      riskLevel = "Medium";
      blacklistReason = `Average performance score (${averageScore}) is within warning range.`;
    } else if (severeIssueCount >= 2) {
      status = "Warning";
      riskLevel = "Medium";
      blacklistReason = `Accumulated ${severeIssueCount} severe service issues in rating history.`;
    } else if (noRebookCount >= 3) {
      status = "Warning";
      riskLevel = "Medium";
      blacklistReason = `Marked as 'Would not rebook' for ${noRebookCount} events.`;
    }

    // Secondary risk level check for Active status
    if (status === "Active") {
      if (averageScore >= 4.0) {
        riskLevel = "Low";
      } else {
        riskLevel = "Medium"; // Score between 3.2 and 4.0 is Active but monitor
      }
    }

    // Update Vendor
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        averageScore,
        scorePercentage,
        totalEvents: count,
        noRebookCount,
        severeIssueCount,
        status,
        riskLevel,
        blacklistReason
      }
    });

    // Create a status history record if status differs from initial seed status
    if (status !== vendor.status) {
      await prisma.statusHistory.create({
        data: {
          vendorId: vendor.id,
          oldStatus: vendor.status,
          newStatus: status,
          reason: blacklistReason || "Initial score calculation from seed data.",
          changedBy: "System Setup"
        }
      });
    }
  }

  console.log("Database seeded and scores calculated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
