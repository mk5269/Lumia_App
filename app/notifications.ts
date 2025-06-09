// app/notifications.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NEXT_NOTIFICATION_TIMESTAMP_KEY = 'next_notification_timestamp';

// 1. 알림 예약 함수
export async function schedulePushNotification(date: Date, vibrate: boolean) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // ======================= ▼▼▼ 수정된 부분 ▼▼▼ =======================
  // 현재 시간과 목표 시간의 차이를 초(second)로 계산합니다.
  const now = new Date().getTime();
  const scheduledTime = date.getTime();
  const seconds = (scheduledTime - now) / 1000;

  // 0초 이하이면 스케줄링하지 않습니다.
  if (seconds <= 0) {
      console.log("Scheduling time is in the past. Notification not scheduled.");
      return;
  }

  // 'timeInterval' 타입의 트리거를 사용합니다.
  const trigger: Notifications.NotificationTriggerInput = {
    type: 'timeInterval',
    seconds: Math.round(seconds), // 소수점 반올림
  };
  // ======================= ▲▲▲ 수정된 부분 ▲▲▲ =======================

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

// (이하 나머지 코드는 이전 답변과 동일합니다)
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