export interface NormalizedEvent {
  sourceEventId: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  title: string | null;
}

export interface CalendarClient {
  fetchEvents(
    accessToken: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<NormalizedEvent[]>;

  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt: Date;
  }>;
}
