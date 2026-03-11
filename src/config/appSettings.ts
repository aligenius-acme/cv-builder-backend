/**
 * App-wide runtime configuration settings.
 *
 * Settings are stored in the AppSettings table and cached in-memory for 5 minutes.
 * Admins can update settings via the Admin Panel → Settings page.
 *
 * Current settings:
 *  - proSubscriptionEnabled  "true" | "false"  — gates Stripe checkout and Pro upgrade CTAs
 *  - freeMonthlyCredits      numeric string    — credits given to free users on monthly claim
 */

import { prisma } from '../utils/prisma';

// ─── Static defaults (used as fallback if DB is unavailable) ──────────────────

export const SETTING_DEFAULTS: Record<string, string> = {
  proSubscriptionEnabled: 'false',
  freeMonthlyCredits:     '10',
};

// ─── In-memory cache (same TTL as affiliateLinks.ts) ─────────────────────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let _cache: { data: Record<string, string>; ts: number } | null = null;

async function loadCache(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.appSettings.findMany();
    const data: Record<string, string> = { ...SETTING_DEFAULTS };
    for (const row of rows) {
      data[row.key] = row.value;
    }
    _cache = { data, ts: Date.now() };
    return data;
  } catch {
    // DB error — fall back to static defaults silently
    _cache = null;
    return { ...SETTING_DEFAULTS };
  }
}

async function getCache(): Promise<Record<string, string>> {
  if (!_cache || Date.now() - _cache.ts > CACHE_TTL) {
    return loadCache();
  }
  return _cache.data;
}

/** Invalidate cache (call after any admin settings update) */
export function invalidateSettingsCache(): void {
  _cache = null;
}

// ─── Public async getters / setters ──────────────────────────────────────────

/**
 * Get a single setting value.
 * Falls back to SETTING_DEFAULTS if key not in DB.
 */
export async function getSetting(key: string): Promise<string> {
  const data = await getCache();
  return data[key] ?? SETTING_DEFAULTS[key] ?? '';
}

/**
 * Get all settings as a key → value map (includes defaults for any missing keys).
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  return getCache();
}

/**
 * Upsert a setting and invalidate the cache.
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.appSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  invalidateSettingsCache();
}

/**
 * Returns true when the Pro subscription flow is enabled.
 * When false: Stripe checkout is blocked and free monthly credits are available instead.
 */
export async function isProEnabled(): Promise<boolean> {
  const val = await getSetting('proSubscriptionEnabled');
  return val === 'true';
}

/**
 * Returns the number of free credits to award on a monthly claim.
 */
export async function getFreeMonthlyCredits(): Promise<number> {
  const val = await getSetting('freeMonthlyCredits');
  const n = parseInt(val, 10);
  return isNaN(n) || n < 1 ? 10 : n;
}

// ─── DB seeding ───────────────────────────────────────────────────────────────

/**
 * Populate AppSettings with defaults if the table is empty.
 * Safe to call on every startup — no-op if rows already exist.
 */
export async function seedSettingsIfEmpty(): Promise<void> {
  try {
    const count = await prisma.appSettings.count();
    if (count > 0) return;

    await prisma.appSettings.createMany({
      data: Object.entries(SETTING_DEFAULTS).map(([key, value]) => ({ key, value })),
    });
    console.log('[appSettings] Seeded default settings');
  } catch (err) {
    console.error('[appSettings] Seed failed (non-fatal):', err);
  }
}
