import { prisma } from "@/lib/db";
import { googleCalendar } from "./google";
import { microsoftCalendar } from "./microsoft";
import { NormalizedEvent, CalendarClient } from "./types";
import { detectDeadline } from "@/lib/weather/algorithm";
import { computeDayMetrics, computeWeather } from "@/lib/weather/algorithm";
import { DEFAULT_THRESHOLDS, CalendarEvent } from "@/lib/weather/types";

export interface StorageEvent {
  sourceEventId: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  title: string | null;
  isDeadline: boolean;
}

export function normalizeEventForStorage(
  event: NormalizedEvent,
  privacyLevel: string
): StorageEvent {
  const isDeadline = detectDeadline(event.title);

  return {
    sourceEventId: event.sourceEventId,
    startTime: event.startTime,
    endTime: event.endTime,
    isAllDay: event.isAllDay,
    title: privacyLevel === "free_busy" ? null : event.title,
    isDeadline,
  };
}

function getClient(provider: string): CalendarClient {
  return provider === "google" ? googleCalendar : microsoftCalendar;
}

function getWeekBounds(): { timeMin: Date; timeMax: Date } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);

  const nextSunday = new Date(monday);
  nextSunday.setUTCDate(monday.getUTCDate() + 13);

  return { timeMin: monday, timeMax: nextSunday };
}

export async function syncUser(userId: string): Promise<void> {
  const connection = await prisma.calendarConnection.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!connection) return;

  const client = getClient(connection.provider);

  let accessToken = connection.accessToken;
  if (connection.tokenExpiresAt < new Date()) {
    const refreshed = await client.refreshToken(connection.refreshToken);
    accessToken = refreshed.accessToken;
    await prisma.calendarConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: refreshed.accessToken,
        tokenExpiresAt: refreshed.expiresAt,
      },
    });
  }

  const { timeMin, timeMax } = getWeekBounds();
  const events = await client.fetchEvents(accessToken, timeMin, timeMax);

  for (const event of events) {
    const stored = normalizeEventForStorage(event, connection.user.privacyLevel);
    await prisma.syncedEvent.upsert({
      where: {
        userId_sourceEventId: {
          userId,
          sourceEventId: stored.sourceEventId,
        },
      },
      create: { userId, ...stored },
      update: stored,
    });
  }

  const user = connection.user;
  const workingHours =
    parseInt(user.workingHoursEnd.split(":")[0]) -
    parseInt(user.workingHoursStart.split(":")[0]);

  const team = user.teamId
    ? await prisma.team.findUnique({ where: { id: user.teamId } })
    : null;
  const thresholds = (team?.weatherThresholds as typeof DEFAULT_THRESHOLDS) || DEFAULT_THRESHOLDS;

  const allEvents = await prisma.syncedEvent.findMany({
    where: {
      userId,
      startTime: { gte: timeMin },
      endTime: { lte: timeMax },
    },
  });

  const byDate = new Map<string, typeof allEvents>();
  for (const evt of allEvents) {
    const dateKey = evt.startTime.toISOString().split("T")[0];
    const existing = byDate.get(dateKey) || [];
    existing.push(evt);
    byDate.set(dateKey, existing);
  }

  for (const [dateKey, dayEvents] of byDate) {
    const calEvents: CalendarEvent[] = dayEvents.map((e) => ({
      startTime: e.startTime,
      endTime: e.endTime,
      isAllDay: e.isAllDay,
      title: e.title,
      isDeadline: e.isDeadline,
    }));

    const metrics = computeDayMetrics(calEvents, workingHours);
    const condition = computeWeather(metrics, thresholds);

    await prisma.weatherScore.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(dateKey),
        },
      },
      create: {
        userId,
        date: new Date(dateKey),
        meetingsCount: metrics.meetingsCount,
        hoursBlocked: metrics.hoursBlocked,
        percentBlocked: metrics.percentBlocked,
        backToBacks: metrics.backToBacks,
        hasDeadline: metrics.hasDeadline,
        weatherCondition: condition,
      },
      update: {
        meetingsCount: metrics.meetingsCount,
        hoursBlocked: metrics.hoursBlocked,
        percentBlocked: metrics.percentBlocked,
        backToBacks: metrics.backToBacks,
        hasDeadline: metrics.hasDeadline,
        weatherCondition: condition,
        computedAt: new Date(),
      },
    });
  }

  await prisma.calendarConnection.update({
    where: { id: connection.id },
    data: { lastSyncedAt: new Date() },
  });
}

export async function syncAllUsers(): Promise<void> {
  const connections = await prisma.calendarConnection.findMany({
    select: { userId: true },
  });

  for (const conn of connections) {
    try {
      await syncUser(conn.userId);
    } catch (error) {
      console.error(`Sync failed for user ${conn.userId}:`, error);
    }
  }
}
