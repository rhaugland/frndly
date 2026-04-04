import { CalendarClient, NormalizedEvent } from "./types";

export const microsoftCalendar: CalendarClient = {
  async fetchEvents(
    accessToken: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<NormalizedEvent[]> {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${timeMin.toISOString()}&endDateTime=${timeMax.toISOString()}&$top=250&$orderby=start/dateTime`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      throw new Error(`Microsoft Graph API error: ${res.status}`);
    }

    const data = await res.json();

    return (data.value || []).map(
      (item: {
        id: string;
        subject?: string;
        isAllDay: boolean;
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
      }) => ({
        sourceEventId: item.id,
        title: item.subject || null,
        isAllDay: item.isAllDay,
        startTime: new Date(item.start.dateTime + "Z"),
        endTime: new Date(item.end.dateTime + "Z"),
      })
    );
  },

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const res = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: "Calendars.Read offline_access",
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Microsoft token refresh failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  },
};
