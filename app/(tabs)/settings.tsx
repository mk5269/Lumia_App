// app/(tabs)/settings.tsx
import { useAuth } from '@/context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { useMusic } from '../../context/MusicContext';
import { registerForPushNotificationsAsync, schedulePushNotification } from '../notifications';

interface UserSettingsData {
  notificationInterval: string;
  notificationTime: string | null;
  pushNotificationEnabled: boolean;
  lastIssuedAt: string | null;
}

const SettingsScreen = () => {
  const { token } = useAuth();
  const { isMusicOn, setIsMusicOn, selectedMusic, setSelectedMusic } = useMusic();
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_USER_SETTINGS}`, { headers: { Authorization: `Bearer ${token}` } });
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      Alert.alert("오류", "설정 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async (newSettings: Partial<UserSettingsData>) => {
    if (!token || !settings) return;
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await axios.put(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_USER_SETTINGS}`, updatedSettings, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Settings updated successfully on server.');
      await setupNextNotification(updatedSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("오류", "설정 저장에 실패했습니다.");
      fetchSettings();
    }
  };

  const setupNextNotification = async (currentSettings: UserSettingsData) => {
    if (currentSettings.pushNotificationEnabled && currentSettings.notificationTime) {
      const hasPermission = await registerForPushNotificationsAsync();
      if (hasPermission) {
        const [hour, minute] = currentSettings.notificationTime.split(':').map(Number);
        const nextNotificationDate = new Date();
        nextNotificationDate.setHours(hour);
        nextNotificationDate.setMinutes(minute);
        nextNotificationDate.setSeconds(0);

        const now = new Date();

        let lastIssuedDate: Date | null = null;
        if (currentSettings.lastIssuedAt) {
          lastIssuedDate = new Date(currentSettings.lastIssuedAt);
        }

        const isToday = (someDate: Date) => {
          const today = new Date();
          return someDate.getDate() === today.getDate() &&
                 someDate.getMonth() === today.getMonth() &&
                 someDate.getFullYear() === today.getFullYear();
        };

        if ((lastIssuedDate && isToday(lastIssuedDate)) || nextNotificationDate.getTime() < now.getTime()) {
          nextNotificationDate.setDate(nextNotificationDate.getDate() + 1);
        }

        await schedulePushNotification(nextNotificationDate, true);
      } else {
        Alert.alert("알림 권한 필요", "알림을 받으려면 앱 설정에서 알림 권한을 허용해주세요.");
        handleSaveSettings({ ...currentSettings, pushNotificationEnabled: false });
      }
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled.');
    }
  };

  const handleAlarmToggle = (value: boolean) => {
    handleSaveSettings({ pushNotificationEnabled: value });
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}:00`;
      handleSaveSettings({ notificationTime: newTime });
    }
  };

  const getDisplayTime = () => {
    if (!settings || !settings.notificationTime) return new Date();
    const [hour, minute] = settings.notificationTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date;
  };

  if (isLoading || !settings) {
    return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator size="large" /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRowSticky}><Image source={require('../../assets/images/settings.png')} style={styles.icon} /><Text style={styles.title}>설정</Text></View>
      <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>배경 음악</Text><Switch value={isMusicOn} onValueChange={setIsMusicOn} /></View><View style={styles.musicButtons}><TouchableOpacity onPress={() => setSelectedMusic(1)}><Image source={require('../../assets/images/music1.png')} style={[styles.musicImage, selectedMusic === 1 && styles.selected]} /><Text style={styles.musicLabel}>Track I</Text></TouchableOpacity><TouchableOpacity onPress={() => setSelectedMusic(2)}><Image source={require('../../assets/images/music2.png')} style={[styles.musicImage, selectedMusic === 2 && styles.selected]} /><Text style={styles.musicLabel}>Track II</Text></TouchableOpacity></View></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>루미아의 인사</Text><View style={styles.sectionHeader}><Text style={styles.subText}>푸시 알림 받기</Text><Switch value={settings.pushNotificationEnabled} onValueChange={handleAlarmToggle} /></View><Text style={styles.subText}>지정한 시간에 새로운 메시지 도착 알림을 보내 드려요.</Text><TouchableOpacity style={[styles.timePicker, !settings.pushNotificationEnabled && styles.disabledPicker]} onPress={() => settings.pushNotificationEnabled && setShowPicker(true)} disabled={!settings.pushNotificationEnabled}><Text style={!settings.pushNotificationEnabled && styles.disabledText}>{settings.notificationTime ? new Date(`1970-01-01T${settings.notificationTime}`).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }) : '시간 설정'}</Text></TouchableOpacity>

        {Platform.OS === 'android' && showPicker && <DateTimePicker value={getDisplayTime()}  mode="time" display="default" onChange={onTimeChange} />}

        {Platform.OS === 'ios' && showPicker && (
          <Modal transparent animationType="slide">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowPicker(false)}>
                  <Text style={styles.closeText}>닫기</Text>
                </TouchableOpacity>
                <DateTimePicker value={getDisplayTime()} mode="time" display="spinner" onChange={onTimeChange} style={{ backgroundColor: 'white' }} themeVariant="light" />
              </View>
            </TouchableOpacity>
          </Modal>
        )}
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>환경 설정</Text><View style={styles.sectionHeader}><Text style={styles.extraText}>앱 버전</Text><Text style={styles.extraText}>v{Constants.manifest?.version ?? '1.0.0'}</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleRowSticky: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#F9F9FB', zIndex: 10 },
  icon: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 26, fontWeight: '600', color: '#222' },
    section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  subText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
    extraText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },

 musicButtons: { flexDirection: 'row', justifyContent: 'center', gap: 70, marginTop: 10 },
  musicImage: { width: 100, height: 100, borderRadius: 14, marginBottom: 8 },
  musicLabel: { textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#444' },
  selected: { borderWidth: 3, borderColor: '#6C9EFF', borderRadius: 5 },
  timePicker: { marginTop: 10, padding: 14, backgroundColor: '#F1F3F5', borderRadius: 10, alignItems: 'center' },
  disabledPicker: { backgroundColor: '#E9ECEF' },
  disabledText: { color: '#ADB5BD' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  closeButton: { alignSelf: 'flex-end', padding: 10 },
  closeText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
});

export default SettingsScreen;