export interface NotificationType {
  message: string;
  time: Date;
}

// A single notification
export function CreateNotification(message: string, date: Date): NotificationType {
  return { message, time: date };
}
