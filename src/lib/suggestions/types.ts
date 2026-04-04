export interface TimeWindow {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface ScoredWindow extends TimeWindow {
  score: number;
}

export interface Suggestion {
  userId: string;
  userName: string;
  message: string;
  type: "best_time" | "avoid" | "rare_opening" | "pattern";
  window?: TimeWindow;
}

export interface UserSchedule {
  userId: string;
  userName: string;
  events: { startTime: Date; endTime: Date }[];
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
  weatherCondition: string;
}
