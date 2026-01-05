import { google } from 'googleapis';
import config from '../config';

// Google Calendar API Service
// FREE - No cost for basic calendar operations

const oauth2Client = new google.auth.OAuth2(
  config.oauth.google.clientId,
  config.oauth.google.clientSecret,
  config.oauth.google.redirectUri
);

// Set credentials for a user
export function setUserCredentials(accessToken: string, refreshToken?: string) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2Client;
}

// Create calendar event for interview
export interface InterviewEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: 'email' | 'popup'; minutes: number }[];
  };
}

export async function createInterviewEvent(
  accessToken: string,
  event: InterviewEvent
): Promise<{ eventId: string; htmlLink: string }> {
  const auth = setUserCredentials(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const calendarEvent = {
    summary: event.title,
    description: event.description || 'Interview scheduled via ResumeAI',
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    location: event.location,
    attendees: event.attendees?.map((email) => ({ email })),
    reminders: event.reminders || {
      useDefault: false,
      overrides: [
        { method: 'email' as const, minutes: 24 * 60 }, // 1 day before
        { method: 'popup' as const, minutes: 60 }, // 1 hour before
        { method: 'popup' as const, minutes: 15 }, // 15 minutes before
      ],
    },
    colorId: '9', // Blue color for interviews
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: calendarEvent,
    sendUpdates: 'all', // Send email invites to attendees
  });

  return {
    eventId: response.data.id!,
    htmlLink: response.data.htmlLink!,
  };
}

// Update calendar event
export async function updateInterviewEvent(
  accessToken: string,
  eventId: string,
  updates: Partial<InterviewEvent>
): Promise<{ eventId: string; htmlLink: string }> {
  const auth = setUserCredentials(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const updateData: any = {};

  if (updates.title) updateData.summary = updates.title;
  if (updates.description) updateData.description = updates.description;
  if (updates.location) updateData.location = updates.location;
  if (updates.startTime) {
    updateData.start = {
      dateTime: updates.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  if (updates.endTime) {
    updateData.end = {
      dateTime: updates.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  const response = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: updateData,
    sendUpdates: 'all',
  });

  return {
    eventId: response.data.id!,
    htmlLink: response.data.htmlLink!,
  };
}

// Delete calendar event
export async function deleteInterviewEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const auth = setUserCredentials(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
  });
}

// Get upcoming interviews from calendar
export async function getUpcomingInterviews(
  accessToken: string,
  maxResults: number = 10
): Promise<Array<{
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  htmlLink: string;
}>> {
  const auth = setUserCredentials(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
    q: 'interview', // Search for events with "interview" in title/description
  });

  return (response.data.items || []).map((event) => ({
    id: event.id!,
    title: event.summary || 'Interview',
    start: new Date(event.start?.dateTime || event.start?.date || ''),
    end: new Date(event.end?.dateTime || event.end?.date || ''),
    location: event.location,
    htmlLink: event.htmlLink!,
  }));
}

// Generate Google Calendar authorization URL with calendar scope
export function getCalendarAuthUrl(state?: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
    prompt: 'consent',
  });
}

// Check if Google Calendar is configured
export function isGoogleCalendarConfigured(): boolean {
  return !!(config.oauth.google.clientId && config.oauth.google.clientSecret);
}
