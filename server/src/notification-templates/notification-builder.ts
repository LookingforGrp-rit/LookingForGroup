import type { NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';

/**
 * Defines behavior for a class that builds a notification for the sake of polymorphism.
 * If you are implementing notifications for your feature, make a new class and have it implement this interface.
 */
export interface NotificationBuilder {
  /**
   * Builds a notification.
   */
  buildNotification(request: Request): Promise<NotificationBuilderResult>;
}
