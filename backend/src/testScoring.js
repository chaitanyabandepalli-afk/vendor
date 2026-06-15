import { PrismaClient } from '@prisma/client';
import { calculateRatingScore, recalculateVendorStats } from './services/scoreCalculator.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING BACKEND SCORING ENGINE TESTS");
  console.log("=================================================");

  let testVendor = null;

  try {
    // 1. Create a dummy test vendor
    console.log("Step 1: Creating a test vendor...");
    testVendor = await prisma.vendor.create({
      data: {
        name: "Scoring Test Vendor Ltd",
        category: "Caterer",
        contactPerson: "Test Agent",
        phone: "+91 99999 88888",
        email: "test@scoringengine.com",
        location: "Test City",
        status: "Active",
        riskLevel: "Low"
      }
    });
    console.log(`✓ Test Vendor created with ID: ${testVendor.id}`);

    // 2. Test positive score calculation
    console.log("\nStep 2: Submitting a perfect rating (5.0 stars)...");
    const perfectScores = { punctuality: 5, quality: 5, professionalism: 5, costBehavior: 5, communication: 5 };
    const scoreResult1 = await calculateRatingScore(perfectScores);
    console.log(`✓ Score calculation: ${scoreResult1.finalScore} / 5.0 (${scoreResult1.scorePercentage}%)`);

    if (scoreResult1.finalScore !== 5.0) {
      throw new Error(`Expected perfect score to be 5.0, got ${scoreResult1.finalScore}`);
    }

    // Save perfect rating
    await prisma.rating.create({
      data: {
        vendorId: testVendor.id,
        eventName: "Perfect Test Event",
        eventDate: new Date(),
        eventType: "Wedding",
        clientName: "Test Client",
        venue: "Test Hall",
        ratedBy: "Test Suite",
        ...perfectScores,
        finalScore: scoreResult1.finalScore,
        scorePercentage: scoreResult1.scorePercentage,
        wouldRebook: true,
        issues: "",
        feedback: "Exemplary performance across all domains!"
      }
    });

    // Recalculate vendor stats
    let updatedVendor = await recalculateVendorStats(testVendor.id, "Test Suite Run");
    console.log(`✓ Vendor stats recalculated. Avg Score: ${updatedVendor.averageScore}, Status: ${updatedVendor.status}, Risk: ${updatedVendor.riskLevel}`);
    
    if (updatedVendor.status !== "Active" || updatedVendor.riskLevel !== "Low") {
      throw new Error(`Expected Active/Low status/risk for 5.0 score, got ${updatedVendor.status}/${updatedVendor.riskLevel}`);
    }

    // 3. Test warning score calculation
    console.log("\nStep 3: Submitting a warning range rating (2.8 stars)...");
    const warningScores = { punctuality: 3, quality: 3, professionalism: 2, costBehavior: 3, communication: 3 }; // 3*0.25+3*0.25+2*0.2+3*0.15+3*0.15 = 0.75+0.75+0.4+0.45+0.45 = 2.8
    const scoreResult2 = await calculateRatingScore(warningScores);
    console.log(`✓ Score calculation: ${scoreResult2.finalScore} / 5.0 (${scoreResult2.scorePercentage}%)`);

    await prisma.rating.create({
      data: {
        vendorId: testVendor.id,
        eventName: "Mediocre Test Event",
        eventDate: new Date(),
        eventType: "Corporate Event",
        clientName: "Test Client 2",
        venue: "Test Hall 2",
        ratedBy: "Test Suite",
        ...warningScores,
        finalScore: scoreResult2.finalScore,
        scorePercentage: scoreResult2.scorePercentage,
        wouldRebook: true,
        issues: "",
        feedback: "Average delivery. Delayed arrival."
      }
    });

    updatedVendor = await recalculateVendorStats(testVendor.id, "Test Suite Run");
    console.log(`✓ Vendor stats recalculated. Avg Score: ${updatedVendor.averageScore}, Status: ${updatedVendor.status}, Risk: ${updatedVendor.riskLevel}`);
    
    // Total ratings: [5.0, 2.8] -> Average: 3.9 -> Active but risk becomes Medium (Monitor) because score is < 4.0
    if (updatedVendor.status !== "Active" || updatedVendor.riskLevel !== "Medium") {
      throw new Error(`Expected Active/Medium standing for average score ${updatedVendor.averageScore}, got ${updatedVendor.status}/${updatedVendor.riskLevel}`);
    }

    // 4. Test automatic blacklisting via severe issues (Cancellation + Client Complaint)
    console.log("\nStep 4: Submitting rating with 'Last-minute cancellation' and 'Client complaint'...");
    const badScores = { punctuality: 1, quality: 2, professionalism: 1, costBehavior: 2, communication: 1 };
    const scoreResult3 = await calculateRatingScore(badScores);

    await prisma.rating.create({
      data: {
        vendorId: testVendor.id,
        eventName: "Disastrous Test Event",
        eventDate: new Date(),
        eventType: "Birthday",
        clientName: "Test Client 3",
        venue: "Test Hall 3",
        ratedBy: "Test Suite",
        ...badScores,
        finalScore: scoreResult3.finalScore,
        scorePercentage: scoreResult3.scorePercentage,
        wouldRebook: false,
        issues: "Last-minute cancellation, Client complaint",
        feedback: "Cancelled one truck, and the client complained about the setup quality."
      }
    });

    updatedVendor = await recalculateVendorStats(testVendor.id, "Test Suite Run");
    console.log(`✓ Vendor stats recalculated. Avg Score: ${updatedVendor.averageScore}, Status: ${updatedVendor.status}, Risk: ${updatedVendor.riskLevel}`);
    console.log(`✓ Blacklist reason: ${updatedVendor.blacklistReason}`);

    if (updatedVendor.status !== "Blacklisted" || updatedVendor.riskLevel !== "High") {
      throw new Error(`Expected Blacklisted/High standing due to severe cancellation+complaint, got ${updatedVendor.status}/${updatedVendor.riskLevel}`);
    }

    console.log("\n=================================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (testVendor) {
      console.log("\nCleaning up test database records...");
      await prisma.rating.deleteMany({ where: { vendorId: testVendor.id } });
      await prisma.statusHistory.deleteMany({ where: { vendorId: testVendor.id } });
      await prisma.vendor.delete({ where: { id: testVendor.id } });
      console.log("✓ Cleanup completed.");
    }
    await prisma.$disconnect();
  }
}

runTests();
