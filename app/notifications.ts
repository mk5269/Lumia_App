// app/notifications.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NEXT_NOTIFICATION_TIMESTAMP_KEY = 'next_notification_timestamp';

export async function schedulePushNotification(date: Date, vibrate: boolean) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date().getTime();
  const scheduledTime = date.getTime();
  const seconds = (scheduledTime - now) / 1000;

  if (seconds <= 0) {
    console.log("Scheduling time is in the past. Notification not scheduled.");
    return;
  }

  // 가장 유력한 'timeInterval' 타입에 'as any'를 추가하여 타입 오류를 우회합니다.
  const trigger = {
    type: 'timeInterval',
    seconds: Math.round(seconds),
  } as any;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌞 무디의 인사',
        body: '새로운 메시지가 도착했어요! 루미아와 이야기해보세요.',
        sound: true,
        vibrate: vibrate ? [0, 250, 250, 250] : undefined,
      },
      trigger,
    });
    
    await AsyncStorage.setItem(NEXT_NOTIFICATION_TIMESTAMP_KEY, date.getTime().toString());
    console.log('✅ 단일 알림 예약 성공, ID:', id, '예약 시간:', date.toLocaleString());
    
  } catch (error) {
    console.error("알림 예약 실패:", error);
  }
}

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});