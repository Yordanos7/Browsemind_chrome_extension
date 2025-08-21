import express from "express";
import { PrismaClient } from "../generated/prisma";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();
const prisma = new PrismaClient();

// Get user's browsing data
router.get("/browsing-data", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate } = req.query;

    const browsingData = await prisma.browsingData.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(browsingData);
  } catch (error) {
    console.error("Error fetching browsing data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sync browsing data from extension
router.post("/sync-data", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { usageData } = req.body;

    // Convert usage data to Prisma format
    const dataToCreate = Object.entries(usageData).map(([date, minutes]) => ({
      date: new Date(date),
      minutes: minutes as number,
      domain: "aggregated",
      userId,
    }));

    // Upsert browsing data
    for (const data of dataToCreate) {
      await prisma.browsingData.upsert({
        where: {
          userId_date_domain: {
            userId: data.userId,
            date: data.date,
            domain: data.domain,
          },
        },
        update: { minutes: data.minutes },
        create: data,
      });
    }

    res.json({ message: "Data synced successfully" });
  } catch (error) {
    console.error("Error syncing data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get blocked sites
router.get("/blocked-sites", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const blockedSites = await prisma.blockedSite.findMany({
      where: { userId },
      select: { url: true },
    });

    res.json(blockedSites.map((site: { url: string }) => site.url));
  } catch (error) {
    console.error("Error fetching blocked sites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sync blocked sites
router.post("/blocked-sites", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { blockedSites } = req.body;

    // Delete existing blocked sites
    await prisma.blockedSite.deleteMany({
      where: { userId },
    });

    // Create new blocked sites
    if (blockedSites.length > 0) {
      await prisma.blockedSite.createMany({
        data: blockedSites.map((url: string) => ({
          url,
          userId,
        })),
      });
    }

    res.json({ message: "Blocked sites synced successfully" });
  } catch (error) {
    console.error("Error syncing blocked sites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user settings
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user settings
router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { dailyLimit, focusDuration } = req.body;

    const settings = await prisma.settings.update({
      where: { userId },
      data: {
        dailyLimit,
        focusDuration,
      },
    });

    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
