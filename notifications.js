import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function scheduleDailyReminder() {
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = newStatus;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted.');
    return;
  }

  // Önceki bildirimleri temizle
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔁 Günlük Hatırlatma",
      body: "Bugünkü alışkanlık hedeflerini unutma!",
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}
