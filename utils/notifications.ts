// utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { Alert, } from 'react-native';
// 1. 알림 예약 함수 (vibrate 인자 추가)
export async function schedulePushNotification(date: Date, vibrate: boolean) {
  console.log(`schedulePushNotification: Called with date: ${date.toISOString()}, vibrate: ${vibrate}`); // 함수 호출 확인 로그
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('schedulePushNotification: All previous notifications cancelled.');

  const trigger = {
    type: 'calendar',
    hour: date.getHours(),
    minute: date.getMinutes(),
    repeats: true,
  } as unknown as Notifications.NotificationTriggerInput;
  console.log('schedulePushNotification: Trigger created:', trigger);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌞 루미아의 인사', // 앱 이름에 맞게 수정 (예: '무디' -> '루미아')
        body: '오늘 하루도 수고했어요! 마음은 잘 돌보고 있나요?',
        sound: 'default', // 명시적으로 default 사운드 사용
        vibrate: vibrate ? [0, 250, 250, 250] : undefined,
      },
      trigger,
    });
    console.log('✅ 알림 예약됨, ID:', id); // 이 로그가 찍혀야 합니다.
    return id; // 예약된 알림 ID 반환 (선택적)
  } catch (error) {
    console.error('schedulePushNotification: Error scheduling notification:', error);
    throw error; // 에러를 다시 던져서 호출한 쪽에서 알 수 있도록 함
  }
}

// 2. 알림 권한 요청 함수
export async function registerForPushNotificationsAsync() {
  console.log('registerForPushNotificationsAsync: Requesting permissions...');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  console.log(`registerForPushNotificationsAsync: Existing status: ${existingStatus}`);

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log(`registerForPushNotificationsAsync: New status after request: ${finalStatus}`);
  }

  if (finalStatus !== 'granted') {
    Alert.alert('알림 권한이 필요합니다!', '앱 설정에서 알림 권한을 허용해주세요.'); // 사용자에게 좀 더 친절한 안내
    console.log('registerForPushNotificationsAsync: Permission not granted.');
    return false;
  }

  console.log('registerForPushNotificationsAsync: Permission granted.');
  return true;
}

// 3. 알림 도착 시 앱이 어떻게 반응할지 설정
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('Notifications.setNotificationHandler: Received notification:', notification);
    return {
      shouldShowAlert: true, // @deprecated 되었지만, 일부 플랫폼/상황 호환성 위해 유지 가능. 대신 아래 banner/list 사용 권장.
      shouldShowBanner: true, // 배너 알림 표시
      shouldShowList: true,   // 알림 목록에 표시
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
  handleError: (error) => { // 에러 핸들러 추가
    console.error('Notifications.setNotificationHandler: Error handling notification:', error);
  },
});