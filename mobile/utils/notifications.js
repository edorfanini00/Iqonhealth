import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════════
// Push Notification Helpers — dose reminders
// ═══════════════════════════════════════════════════════════════

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permission
export async function registerForNotifications() {
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('dose-reminders', {
      name: 'Dose Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return true;
}

// Schedule a daily notification for a compound at its dose time
export async function scheduleDoseReminder(compound, doseTime, frequency, userName) {
  const [hours, minutes] = doseTime.split(':').map(Number);
  const name = userName || 'there';

  // Cancel any existing for this compound first
  await cancelDoseReminder(compound);

  try {
    if (frequency === 'daily') {
      // Daily repeating — use calendar trigger
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💉 Time for your dose!',
          body: `Hey ${name}, it's time to take your ${compound}!`,
          data: { compound },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    } else {
      // Non-daily: schedule the next occurrence only
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      const seconds = Math.max(1, Math.floor((target - now) / 1000));

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💉 Time for your dose!',
          body: `Hey ${name}, it's time to take your ${compound}!`,
          data: { compound },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: false,
        },
      });
    }
  } catch (err) {
    console.log('Failed to schedule notification:', err);
  }
}

// Cancel notifications for a specific compound
export async function cancelDoseReminder(compound) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.compound === compound) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (err) {
    console.log('Failed to cancel notification:', err);
  }
}

// Schedule all reminders for a protocol's compounds
export async function scheduleProtocolReminders(compounds, userName) {
  for (const comp of compounds) {
    if (comp.compound && comp.doseTime) {
      await scheduleDoseReminder(
        comp.compound,
        comp.doseTime,
        comp.frequency || 'daily',
        userName
      );
    }
  }
}

// Cancel all dose reminders
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
