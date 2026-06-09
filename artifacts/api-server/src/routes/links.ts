import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, dateLinksTable, visitsTable, bookingsTable } from "@workspace/db";
import {
  CreateLinkBody,
  GetLinkParams,
  DeleteLinkParams,
  RecordVisitParams,
  RecordVisitBody,
  ConfirmDateParams,
  ConfirmDateBody,
  GetLinkBookingsParams,
  GetLinkVisitsParams,
} from "@workspace/api-zod";
import { lookupIp } from "../lib/geo";
import { sendBookingNotification } from "../lib/email";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// List all links (admin)
router.get("/links", async (req, res): Promise<void> => {
  const links = await db.select().from(dateLinksTable).orderBy(dateLinksTable.createdAt);
  res.json(links.map(l => ({
    id: l.id,
    customMessage: l.customMessage,
    createdAt: l.createdAt.toISOString(),
    visitCount: l.visitCount,
    yesCount: l.yesCount,
  })));
});

// Create a new link (admin)
router.post("/links", async (req, res): Promise<void> => {
  const parsed = CreateLinkBody.safeParse(req.body);
  const customMessage = parsed.success ? parsed.data.customMessage ?? null : null;

  const id = randomUUID().replace(/-/g, "").substring(0, 12);

  const [link] = await db.insert(dateLinksTable).values({
    id,
    customMessage,
  }).returning();

  res.status(201).json({
    id: link.id,
    customMessage: link.customMessage,
    createdAt: link.createdAt.toISOString(),
    visitCount: link.visitCount,
    yesCount: link.yesCount,
  });
});

// Get a single link (public)
router.get("/links/:linkId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.linkId) ? req.params.linkId[0] : req.params.linkId;
  const params = GetLinkParams.safeParse({ linkId: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid link ID" });
    return;
  }

  const [link] = await db.select().from(dateLinksTable).where(eq(dateLinksTable.id, params.data.linkId));
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json({
    id: link.id,
    customMessage: link.customMessage,
    createdAt: link.createdAt.toISOString(),
    visitCount: link.visitCount,
    yesCount: link.yesCount,
  });
});

// Delete a link (admin)
router.delete("/links/:linkId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.linkId) ? req.params.linkId[0] : req.params.linkId;
  const params = DeleteLinkParams.safeParse({ linkId: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid link ID" });
    return;
  }

  await db.delete(dateLinksTable).where(eq(dateLinksTable.id, params.data.linkId));
  res.json({ success: true });
});

// Record a visit (public)
router.post("/links/:linkId/visit", async (req, res): Promise<void> => {
  const rawLinkId = Array.isArray(req.params.linkId) ? req.params.linkId[0] : req.params.linkId;
  const params = RecordVisitParams.safeParse({ linkId: rawLinkId });
  if (!params.success) {
    res.status(400).json({ error: "Invalid link ID" });
    return;
  }

  // Get client IP
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress ?? null;
  const ip = rawIp ?? null;

  const body = RecordVisitBody.safeParse(req.body);
  const userAgent = body.success ? body.data.userAgent ?? null : null;

  // Geo lookup (non-blocking)
  const geo = ip ? await lookupIp(ip) : {};

  const [visit] = await db.insert(visitsTable).values({
    linkId: params.data.linkId,
    ip,
    city: geo.city ?? null,
    country: geo.country ?? null,
    userAgent,
  }).returning();

  // Increment visit count
  await db.update(dateLinksTable)
    .set({ visitCount: sql`${dateLinksTable.visitCount} + 1` })
    .where(eq(dateLinksTable.id, params.data.linkId));

  res.status(201).json({
    id: visit.id,
    linkId: visit.linkId,
    ip: visit.ip,
    city: visit.city,
    country: visit.country,
    userAgent: visit.userAgent,
    createdAt: visit.createdAt.toISOString(),
  });
});

// Confirm a date (public)
router.post("/links/:linkId/confirm", async (req, res): Promise<void> => {
  const rawLinkId = Array.isArray(req.params.linkId) ? req.params.linkId[0] : req.params.linkId;
  const params = ConfirmDateParams.safeParse({ linkId: rawLinkId });
  if (!params.success) {
    res.status(400).json({ error: "Invalid link ID" });
    return;
  }

  const body = ConfirmDateBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [link] = await db.select().from(dateLinksTable).where(eq(dateLinksTable.id, params.data.linkId));
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const [booking] = await db.insert(bookingsTable).values({
    linkId: params.data.linkId,
    dateType: body.data.dateType,
    customDateType: body.data.customDateType ?? null,
    date: body.data.date,
    time: body.data.time,
  }).returning();

  // Increment yes count
  await db.update(dateLinksTable)
    .set({ yesCount: sql`${dateLinksTable.yesCount} + 1` })
    .where(eq(dateLinksTable.id, params.data.linkId));

  // Get latest visit for notification
  const [latestVisit] = await db.select().from(visitsTable)
    .where(eq(visitsTable.linkId, params.data.linkId))
    .orderBy(sql`${visitsTable.createdAt} DESC`)
    .limit(1);

  // Send email notification (fire and forget)
  sendBookingNotification({
    linkId: params.data.linkId,
    dateType: booking.dateType,
    customDateType: booking.customDateType,
    date: booking.date,
    time: booking.time,
    confirmedAt: booking.confirmedAt.toISOString(),
    visitorIp: latestVisit?.ip ?? null,
    visitorCity: latestVisit?.city ?? null,
    visitorCountry: latestVisit?.country ?? null,
  }).catch(() => {});

  res.status(201).json({
    id: booking.id,
    linkId: booking.linkId,
    dateType: booking.dateType,
    customDateType: booking.customDateType,
    date: booking.date,
    time: booking.time,
    confirmedAt: booking.confirmedAt.toISOString(),
  });
});

// Get bookings for a link (admin)
router.get("/links/:linkId/bookings", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.linkId) ? req.params.linkId[0] : req.params.linkId;
  const params = GetLinkBookingsParams.safeParse({ linkId: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid link ID" });
    return;
  }

  const bookings = await db.select().from(bookingsTable)
    .where(eq(bookingsTable.linkId, params.data.linkId))
    .orderBy(bookingsTable.confirmedAt);

  res.json(bookings.map(b => ({
    id: b.id,
    linkId: b.linkId,
    dateType: b.dateType,
    customDateType: b.customDateType,
    date: b.date,
    time: b.time,
    confirmedAt: b.confirmedAt.toISOString(),
  })));
});

// Get visits for a link (admin)
router.get("/links/:linkId/visits", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.linkId) ? req.params.linkId[0] : req.params.linkId;
  const params = GetLinkVisitsParams.safeParse({ linkId: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid link ID" });
    return;
  }

  const visits = await db.select().from(visitsTable)
    .where(eq(visitsTable.linkId, params.data.linkId))
    .orderBy(visitsTable.createdAt);

  res.json(visits.map(v => ({
    id: v.id,
    linkId: v.linkId,
    ip: v.ip,
    city: v.city,
    country: v.country,
    userAgent: v.userAgent,
    createdAt: v.createdAt.toISOString(),
  })));
});

export default router;
