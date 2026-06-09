import { logger } from "./logger";

interface GeoResult {
  city?: string;
  country?: string;
}

export async function lookupIp(ip: string): Promise<GeoResult> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return {};
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return {};
    const data = await res.json() as { city?: string; country_name?: string };
    return { city: data.city, country: data.country_name };
  } catch (err) {
    logger.warn({ err, ip }, "IP geo lookup failed");
    return {};
  }
}
