import { Router, type IRouter } from "express";
import { count } from "drizzle-orm";
import { db, dateLinksTable, visitsTable, bookingsTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// Admin login
router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || parsed.data.password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = randomUUID();
  res.json({ success: true, token });
});

// Overall stats
router.get("/stats", async (_req, res): Promise<void> => {
  const [linksResult] = await db.select({ count: count() }).from(dateLinksTable);
  const [visitsResult] = await db.select({ count: count() }).from(visitsTable);
  const [bookingsResult] = await db.select({ count: count() }).from(bookingsTable);

  res.json({
    totalLinks: linksResult?.count ?? 0,
    totalVisits: visitsResult?.count ?? 0,
    totalBookings: bookingsResult?.count ?? 0,
  });
});

export default router;
