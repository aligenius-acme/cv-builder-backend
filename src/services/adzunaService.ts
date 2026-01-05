import axios from 'axios';
import config from '../config';

// Adzuna API response types
interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  created: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  category: {
    label: string;
    tag: string;
  };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_type?: string;
  contract_time?: string;
  latitude?: number;
  longitude?: number;
}

interface AdzunaSearchResponse {
  results: AdzunaJob[];
  count: number;
  mean: number;
  __CLASS__: string;
}

// Transformed job listing for frontend
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  posted: string;
  description: string;
  requirements?: string[];
  source: string;
  url: string;
  logo?: string;
  category?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Country codes supported by Adzuna
export const ADZUNA_COUNTRIES: Record<string, string> = {
  'us': 'United States',
  'gb': 'United Kingdom',
  'au': 'Australia',
  'at': 'Austria',
  'be': 'Belgium',
  'br': 'Brazil',
  'ca': 'Canada',
  'de': 'Germany',
  'fr': 'France',
  'in': 'India',
  'it': 'Italy',
  'mx': 'Mexico',
  'nl': 'Netherlands',
  'nz': 'New Zealand',
  'pl': 'Poland',
  'ru': 'Russia',
  'sg': 'Singapore',
  'za': 'South Africa',
};

// Format salary range
function formatSalary(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined;

  const formatNum = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };

  if (min && max) {
    return `${formatNum(min)} - ${formatNum(max)}`;
  }
  if (min) return `${formatNum(min)}+`;
  if (max) return `Up to ${formatNum(max)}`;
  return undefined;
}

// Format relative time
function formatPostedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Transform Adzuna job to our format
function transformAdzunaJob(job: AdzunaJob): JobListing {
  const contractType = job.contract_time || job.contract_type || 'Full-time';

  return {
    id: job.id,
    title: job.title,
    company: job.company?.display_name || 'Unknown Company',
    location: job.location?.display_name || 'Location not specified',
    salary: formatSalary(job.salary_min, job.salary_max),
    type: contractType.charAt(0).toUpperCase() + contractType.slice(1).replace('_', '-'),
    posted: formatPostedDate(job.created),
    description: job.description,
    source: 'Adzuna',
    url: job.redirect_url,
    category: job.category?.label,
    coordinates: job.latitude && job.longitude ? {
      lat: job.latitude,
      lng: job.longitude,
    } : undefined,
  };
}

// Detect country from location string
function detectCountryCode(location: string): string {
  const locationLower = location.toLowerCase();

  // Check for country names or codes
  const countryMappings: Record<string, string> = {
    'united states': 'us',
    'usa': 'us',
    'us': 'us',
    'america': 'us',
    'united kingdom': 'gb',
    'uk': 'gb',
    'britain': 'gb',
    'england': 'gb',
    'london': 'gb',
    'australia': 'au',
    'sydney': 'au',
    'melbourne': 'au',
    'canada': 'ca',
    'toronto': 'ca',
    'vancouver': 'ca',
    'germany': 'de',
    'berlin': 'de',
    'munich': 'de',
    'france': 'fr',
    'paris': 'fr',
    'india': 'in',
    'bangalore': 'in',
    'mumbai': 'in',
    'netherlands': 'nl',
    'amsterdam': 'nl',
    'singapore': 'sg',
    'new zealand': 'nz',
    'remote': 'us', // Default remote to US
  };

  for (const [key, code] of Object.entries(countryMappings)) {
    if (locationLower.includes(key)) {
      return code;
    }
  }

  return 'us'; // Default to US
}

export interface SearchJobsParams {
  keywords: string;
  location?: string;
  page?: number;
  resultsPerPage?: number;
  salaryMin?: number;
  salaryMax?: number;
  fullTime?: boolean;
  partTime?: boolean;
  permanent?: boolean;
  contract?: boolean;
  sortBy?: 'relevance' | 'date' | 'salary';
  maxDaysOld?: number;
}

export async function searchJobs(params: SearchJobsParams): Promise<{
  jobs: JobListing[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { appId, appKey, baseUrl } = config.adzuna;

  if (!appId || !appKey) {
    throw new Error('Adzuna API credentials not configured');
  }

  const countryCode = detectCountryCode(params.location || 'us');
  const page = params.page || 1;
  const resultsPerPage = params.resultsPerPage || 20;

  // Build query parameters
  const queryParams: Record<string, string | number> = {
    app_id: appId,
    app_key: appKey,
    results_per_page: resultsPerPage,
    what: params.keywords,
    'content-type': 'application/json',
  };

  // Add location if provided (and not just a country)
  if (params.location && !['us', 'usa', 'united states', 'uk', 'remote'].includes(params.location.toLowerCase())) {
    queryParams.where = params.location;
  }

  // Add salary filters
  if (params.salaryMin) {
    queryParams.salary_min = params.salaryMin;
  }
  if (params.salaryMax) {
    queryParams.salary_max = params.salaryMax;
  }

  // Add job type filters
  if (params.fullTime) {
    queryParams.full_time = 1;
  }
  if (params.partTime) {
    queryParams.part_time = 1;
  }
  if (params.permanent) {
    queryParams.permanent = 1;
  }
  if (params.contract) {
    queryParams.contract = 1;
  }

  // Add sorting
  if (params.sortBy === 'date') {
    queryParams.sort_by = 'date';
  } else if (params.sortBy === 'salary') {
    queryParams.sort_by = 'salary';
  }

  // Add days filter
  if (params.maxDaysOld) {
    queryParams.max_days_old = params.maxDaysOld;
  }

  try {
    const url = `${baseUrl}/jobs/${countryCode}/search/${page}`;

    const response = await axios.get<AdzunaSearchResponse>(url, {
      params: queryParams,
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    const { results, count } = response.data;

    return {
      jobs: results.map(transformAdzunaJob),
      total: count,
      page,
      totalPages: Math.ceil(count / resultsPerPage),
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Adzuna API credentials');
    }
    if (error.response?.status === 429) {
      throw new Error('Adzuna API rate limit exceeded. Please try again later.');
    }
    throw new Error(`Failed to search jobs: ${error.message}`);
  }
}

// Get available categories
export async function getCategories(countryCode: string = 'us'): Promise<{ tag: string; label: string }[]> {
  const { appId, appKey, baseUrl } = config.adzuna;

  if (!appId || !appKey) {
    throw new Error('Adzuna API credentials not configured');
  }

  try {
    const url = `${baseUrl}/jobs/${countryCode}/categories`;

    const response = await axios.get(url, {
      params: {
        app_id: appId,
        app_key: appKey,
      },
      timeout: 10000,
    });

    return response.data.results || [];
  } catch (error: any) {
    console.error('Failed to fetch categories:', error.message);
    return [];
  }
}

// Check if Adzuna is configured
export function isAdzunaConfigured(): boolean {
  return !!(config.adzuna.appId && config.adzuna.appKey);
}
