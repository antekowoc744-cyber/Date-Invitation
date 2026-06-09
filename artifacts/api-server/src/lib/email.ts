import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendBookingNotification(booking: {
  linkId: string;
  dateType: string;
  customDateType?: string | null;
  date: string;
  time: string;
  confirmedAt: string;
  visitorIp?: string | null;
  visitorCity?: string | null;
  visitorCountry?: string | null;
}): Promise<void> {
  const transporter = createTransporter();
  const to = process.env.NOTIFICATION_EMAIL;

  if (!transporter || !to) {
    logger.warn("Email not configured — skipping notification. Set GMAIL_USER and GMAIL_APP_PASSWORD to enable.");
    return;
  }

  const dateTypeLabel = booking.customDateType || booking.dateType;
  const locationInfo = [booking.visitorCity, booking.visitorCountry].filter(Boolean).join(", ") || "nieznana";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff0f5; border-radius: 12px;">
      <h1 style="color: #e91e8c; text-align: center;">❤️ Potwierdzono randkę!</h1>
      <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 16px;">
        <h2 style="color: #333;">Szczegóły</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; color: #666; font-weight: bold;">Link ID:</td><td style="padding: 8px;">${booking.linkId}</td></tr>
          <tr><td style="padding: 8px; color: #666; font-weight: bold;">Rodzaj randki:</td><td style="padding: 8px;">${dateTypeLabel}</td></tr>
          <tr><td style="padding: 8px; color: #666; font-weight: bold;">Data:</td><td style="padding: 8px;">${booking.date}</td></tr>
          <tr><td style="padding: 8px; color: #666; font-weight: bold;">Godzina:</td><td style="padding: 8px;">${booking.time}</td></tr>
          <tr><td style="padding: 8px; color: #666; font-weight: bold;">Potwierdzono:</td><td style="padding: 8px;">${new Date(booking.confirmedAt).toLocaleString("pl-PL")}</td></tr>
          <tr><td style="padding: 8px; color: #666; font-weight: bold;">Lokalizacja:</td><td style="padding: 8px;">${locationInfo}</td></tr>
          ${booking.visitorIp ? `<tr><td style="padding: 8px; color: #666; font-weight: bold;">IP:</td><td style="padding: 8px;">${booking.visitorIp}</td></tr>` : ""}
        </table>
      </div>
      <p style="text-align: center; color: #e91e8c; margin-top: 16px;">Randka czeka! 💕</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Randka App" <${process.env.GMAIL_USER}>`,
      to,
      subject: "❤️ Ktoś zgodził się na randkę!",
      html,
    });
    logger.info({ to }, "Booking notification email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send booking notification email");
  }
}
