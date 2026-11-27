import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { PlannedReminder } from "@/domain/reminders";

export const CHANNEL_ID = "prayer-reminders";

/** The two calls needed to replace all reminders; a fake can stand in for it in tests. */
export interface Notifier {
  cancelAll(): Promise<void>;
  schedule(reminder: PlannedReminder): Promise<void>;
}

/** Replaces every scheduled reminder with `planned`. Returns how many were scheduled. */
export async function applyReminders(
  notifier: Notifier,
  planned: PlannedReminder[],
): Promise<number> {
  await notifier.cancelAll();
  for (const reminder of planned) await notifier.schedule(reminder);
  return planned.length;
}

export const expoNotifier: Notifier = {
  cancelAll: () => Notifications.cancelAllScheduledNotificationsAsync(),
  async schedule(r) {
    await Notifications.scheduleNotificationAsync({
      identifier: r.id,
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: r.at,
        channelId: CHANNEL_ID,
      },
    });
  },
};

/** Show reminders as a banner even when the app is open. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Prayer reminders",
    // The enum is exported; the lint plugin cannot follow the package's re-exports.
    // eslint-disable-next-line import/namespace
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/** Asks for notification permission if needed. Returns whether reminders may be shown. */
export async function requestReminderPermission(): Promise<boolean> {
  await ensureChannel(); // Android shows the permission prompt only once a channel exists
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}
