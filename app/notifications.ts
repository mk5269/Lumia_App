import * as Notifications from 'expo-notifications';

// 1. 알림 예약 함수
export async function schedulePushNotification(date: Date) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const trigger = {
    type: 'calendar',
    hour: date.getHours(),
    minute: date.getMinutes(),
    repeats: true,
  } as unknown as Notifications.NotificationTriggerInput;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌞 무디의 인사',
      body: '오늘 하루도 수고했어요! 마음은 잘 돌보고 있나요?',
      sound: 'default',
    },
    trigger,
  });

  console.log('✅ 알림 예약됨, ID:', id);
}

// 2. 알림 권한 요청 함수
export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('알림 권한이 필요합니다!');
    return false;
  }

  return true;
}

// 3. 알림 도착 시 앱이 어떻게 할지 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,   // 알림 소리 재생 설정
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
