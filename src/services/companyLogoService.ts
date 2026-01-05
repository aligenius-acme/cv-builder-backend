// Company Logo Service
// Uses FREE APIs:
// 1. Clearbit Logo API (no key required): https://logo.clearbit.com/{domain}
// 2. UI Avatars (free): https://ui-avatars.com/api/

// Common company domain mappings
const COMPANY_DOMAINS: Record<string, string> = {
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'apple': 'apple.com',
  'amazon': 'amazon.com',
  'meta': 'meta.com',
  'facebook': 'facebook.com',
  'netflix': 'netflix.com',
  'twitter': 'twitter.com',
  'x': 'x.com',
  'linkedin': 'linkedin.com',
  'salesforce': 'salesforce.com',
  'oracle': 'oracle.com',
  'ibm': 'ibm.com',
  'intel': 'intel.com',
  'nvidia': 'nvidia.com',
  'adobe': 'adobe.com',
  'spotify': 'spotify.com',
  'uber': 'uber.com',
  'airbnb': 'airbnb.com',
  'stripe': 'stripe.com',
  'shopify': 'shopify.com',
  'slack': 'slack.com',
  'zoom': 'zoom.us',
  'dropbox': 'dropbox.com',
  'github': 'github.com',
  'gitlab': 'gitlab.com',
  'atlassian': 'atlassian.com',
  'jira': 'atlassian.com',
  'confluence': 'atlassian.com',
  'trello': 'trello.com',
  'asana': 'asana.com',
  'notion': 'notion.so',
  'figma': 'figma.com',
  'canva': 'canva.com',
  'paypal': 'paypal.com',
  'square': 'squareup.com',
  'twilio': 'twilio.com',
  'mongodb': 'mongodb.com',
  'elastic': 'elastic.co',
  'datadog': 'datadog.com',
  'snowflake': 'snowflake.com',
  'palantir': 'palantir.com',
  'coinbase': 'coinbase.com',
  'robinhood': 'robinhood.com',
  'docusign': 'docusign.com',
  'okta': 'okta.com',
  'crowdstrike': 'crowdstrike.com',
  'palo alto': 'paloaltonetworks.com',
  'vmware': 'vmware.com',
  'cisco': 'cisco.com',
  'dell': 'dell.com',
  'hp': 'hp.com',
  'lenovo': 'lenovo.com',
  'samsung': 'samsung.com',
  'sony': 'sony.com',
  'lg': 'lg.com',
  'toyota': 'toyota.com',
  'tesla': 'tesla.com',
  'ford': 'ford.com',
  'gm': 'gm.com',
  'general motors': 'gm.com',
  'boeing': 'boeing.com',
  'lockheed': 'lockheedmartin.com',
  'raytheon': 'rtx.com',
  'jpmorgan': 'jpmorgan.com',
  'jp morgan': 'jpmorgan.com',
  'goldman sachs': 'goldmansachs.com',
  'morgan stanley': 'morganstanley.com',
  'bank of america': 'bankofamerica.com',
  'wells fargo': 'wellsfargo.com',
  'citibank': 'citi.com',
  'citi': 'citi.com',
  'american express': 'americanexpress.com',
  'amex': 'americanexpress.com',
  'visa': 'visa.com',
  'mastercard': 'mastercard.com',
  'deloitte': 'deloitte.com',
  'pwc': 'pwc.com',
  'kpmg': 'kpmg.com',
  'ey': 'ey.com',
  'ernst young': 'ey.com',
  'accenture': 'accenture.com',
  'mckinsey': 'mckinsey.com',
  'bcg': 'bcg.com',
  'bain': 'bain.com',
};

// Get company domain from name
export function getCompanyDomain(companyName: string): string | null {
  if (!companyName) return null;

  const normalized = companyName.toLowerCase().trim();

  // Check direct mapping
  if (COMPANY_DOMAINS[normalized]) {
    return COMPANY_DOMAINS[normalized];
  }

  // Check partial matches
  for (const [key, domain] of Object.entries(COMPANY_DOMAINS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return domain;
    }
  }

  // Try to extract domain from company name
  // e.g., "Example Inc" -> "example.com"
  const cleanedName = normalized
    .replace(/\s+(inc\.?|llc\.?|ltd\.?|corp\.?|corporation|company|co\.?)$/i, '')
    .replace(/[^a-z0-9]/g, '');

  if (cleanedName.length > 2) {
    return `${cleanedName}.com`;
  }

  return null;
}

// Get logo URL using Clearbit (FREE, no API key required)
export function getClearbitLogoUrl(domain: string, size: number = 128): string {
  return `https://logo.clearbit.com/${domain}?size=${size}`;
}

// Get fallback logo using UI Avatars (FREE)
export function getUIAvatarUrl(
  companyName: string,
  options: {
    size?: number;
    background?: string;
    color?: string;
    rounded?: boolean;
    bold?: boolean;
  } = {}
): string {
  const {
    size = 128,
    background = '6366f1', // Indigo
    color = 'ffffff',
    rounded = true,
    bold = true,
  } = options;

  // Get initials (up to 2 characters)
  const initials = companyName
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const params = new URLSearchParams({
    name: initials || companyName.slice(0, 2).toUpperCase(),
    size: size.toString(),
    background,
    color,
    rounded: rounded.toString(),
    bold: bold.toString(),
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

// Get company logo with fallback
export interface CompanyLogoResult {
  logoUrl: string;
  source: 'clearbit' | 'ui-avatars';
  domain?: string;
}

export function getCompanyLogo(
  companyName: string,
  size: number = 128
): CompanyLogoResult {
  const domain = getCompanyDomain(companyName);

  if (domain) {
    return {
      logoUrl: getClearbitLogoUrl(domain, size),
      source: 'clearbit',
      domain,
    };
  }

  return {
    logoUrl: getUIAvatarUrl(companyName, { size }),
    source: 'ui-avatars',
  };
}

// Batch get logos for multiple companies
export function getCompanyLogos(
  companies: string[],
  size: number = 64
): Record<string, CompanyLogoResult> {
  const result: Record<string, CompanyLogoResult> = {};

  for (const company of companies) {
    if (company) {
      result[company] = getCompanyLogo(company, size);
    }
  }

  return result;
}

// Verify if Clearbit logo exists (optional check)
export async function verifyClearbitLogo(domain: string): Promise<boolean> {
  try {
    const response = await fetch(getClearbitLogoUrl(domain), {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
