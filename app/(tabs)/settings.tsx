// app/(tabs)/settings.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMusic } from '../../context/MusicContext';

const SettingsScreen = () => {
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const { isMusicOn, setIsMusicOn, selectedMusic, setSelectedMusic } = useMusic();

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        setAlarmTime(selectedDate);
      }
      setShowPicker(false);
    } else {
      if (selectedDate) setAlarmTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Image source={require('../../assets/images/settings.png')} style={styles.icon} />
        <Text style={styles.title}>설정</Text>
      </View>

      {/* === MUSIC SECTION === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Music</Text>
          <Switch value={isMusicOn} onValueChange={setIsMusicOn} />
        </View>

        <View style={styles.musicButtons}>
          <TouchableOpacity onPress={() => setSelectedMusic(1)}>
            <Image
              source={require('../../assets/images/music1.png')}
              style={[styles.musicImage, selectedMusic === 1 && styles.selected]}
            />
            <Text style={styles.musicLabel}>Track I</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSelectedMusic(2)}>
            <Image
              source={require('../../assets/images/music2.png')}
              style={[styles.musicImage, selectedMusic === 2 && styles.selected]}
            />
            <Text style={styles.musicLabel}>Track II</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* === ALARM CLOCK SECTION === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Clock</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.subText}>정기 알림</Text>
          <Switch value={isAlarmOn} onValueChange={setIsAlarmOn} />
        </View>

        <Text style={styles.subText}>지정한 시간에 쪽지 알림을 보내 드려요.</Text>

        <TouchableOpacity style={styles.timePicker} onPress={() => setShowPicker(true)}>
          <Text>
            {alarmTime.toLocaleTimeString('ko-KR', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <Modal transparent={true} animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.closeText}>닫기</Text>
                </TouchableOpacity>
                <DateTimePicker
                  value={alarmTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                  is24Hour={false}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9FB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#222',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
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
  },
  subText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  musicButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  musicImage: {
    width: 100,
    height: 100,
    borderRadius: 14,
    marginBottom: 8,
  },
  musicLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#6C9EFF',
    borderRadius: 14,
  },
  timePicker: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: '#000',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginRight: 170,
    marginTop: 10,
     
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SettingsScreen;
