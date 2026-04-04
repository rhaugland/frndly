import { CalendarClient, NormalizedEvent } from "./types";

export const googleCalendar: CalendarClient = {
  async fetchEvents(
    accessToken: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<NormalizedEvent[]> {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      throw new Error(`Google Calendar API error: ${res.status}`);
    }

    const data = await res.json();

    return (data.items || []).map(
      (item: {
        id: string;
        summary?: string;
        start: { dateTime?: string; date?: string };
        end: { dateTime?: string; date?: string };
      }) => ({
        sourceEventId: item.id,
        title: item.summary || null,
        isAllDay: !item.start.dateTime,
        startTime: new Date(item.start.dateTime || item.start.date!),
        endTime: new Date(item.end.dateTime || item.end.date!),
      })
    );
  },

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      throw new Error(`Google token refresh failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  },
};
