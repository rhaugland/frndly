export enum WeatherCondition {
  Sunny = "sunny",
  PartlyCloudy = "partly_cloudy",
  Cloudy = "cloudy",
  Rain = "rain",
  Thunderstorm = "thunderstorm",
}

export interface WeatherThresholds {
  sunny: { maxPercentBlocked: number; maxMeetings: number };
  partlyCloudy: { maxPercentBlocked: number; maxMeetings: number };
  cloudy: { maxPercentBlocked: number; maxMeetings: number };
  rain: { maxPercentBlocked: number; minBackToBacks: number };
  thunderstorm: { minPercentBlocked: number; deadlinePercentThreshold: number };
}

export const DEFAULT_THRESHOLDS: WeatherThresholds = {
  sunny: { maxPercentBlocked: 25, maxMeetings: 2 },
  partlyCloudy: { maxPercentBlocked: 50, maxMeetings: 4 },
  cloudy: { maxPercentBlocked: 70, maxMeetings: 6 },
  rain: { maxPercentBlocked: 85, minBackToBacks: 3 },
  thunderstorm: { minPercentBlocked: 85, deadlinePercentThreshold: 70 },
};

export interface DayMetrics {
  meetingsCount: number;
  hoursBlocked: number;
  percentBlocked: number;
  backToBacks: number;
  hasDeadline: boolean;
}

export interface CalendarEvent {
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  title: string | null;
  isDeadline: boolean;
}
