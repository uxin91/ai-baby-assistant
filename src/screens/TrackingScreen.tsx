import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FeedingRecord, SleepRecord } from '../types';
import { loadFromStorage, saveToStorage, generateId, formatDateTime } from '../utils/storage';

const FEEDING_KEY = 'baby-feeding-records';
const SLEEP_KEY = 'baby-sleep-records';

const feedingTypeLabels: Record<string, string> = {
  breast: '🤱 母乳',
  bottle: '🍼 奶瓶',
  solid: '🥣 辅食',
};

const qualityLabels: Record<string, string> = {
  good: '😴 好',
  normal: '😐 一般',
  poor: '😫 差',
};

function getSleepDuration(start: string, end?: string): string {
  if (!end) return '进行中...';
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}

function nowString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TrackingScreen() {
  const [activeTab, setActiveTab] = useState<'feeding' | 'sleep'>('feeding');
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [showFeedingForm, setShowFeedingForm] = useState(false);
  const [showSleepForm, setShowSleepForm] = useState(false);

  const [feedType, setFeedType] = useState<'breast' | 'bottle' | 'solid'>('breast');
  const [feedTime, setFeedTime] = useState(nowString());
  const [feedDuration, setFeedDuration] = useState('');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedFood, setFeedFood] = useState('');
  const [feedNote, setFeedNote] = useState('');

  const [sleepStart, setSleepStart] = useState(nowString());
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepQuality, setSleepQuality] = useState<'good' | 'normal' | 'poor'>('normal');
  const [sleepNote, setSleepNote] = useState('');

  useEffect(() => {
    Promise.all([
      loadFromStorage<FeedingRecord[]>(FEEDING_KEY, []),
      loadFromStorage<SleepRecord[]>(SLEEP_KEY, []),
    ]).then(([f, s]) => {
      setFeedingRecords(f);
      setSleepRecords(s);
    });
  }, []);

  const addFeeding = useCallback(() => {
    const record: FeedingRecord = {
      id: generateId(),
      type: feedType,
      startTime: feedTime,
      duration: feedDuration ? parseInt(feedDuration, 10) : undefined,
      amount: feedAmount ? parseInt(feedAmount, 10) : undefined,
      food: feedFood || undefined,
      note: feedNote || undefined,
    };
    const updated = [record, ...feedingRecords];
    setFeedingRecords(updated);
    saveToStorage(FEEDING_KEY, updated);
    setShowFeedingForm(false);
    setFeedDuration('');
    setFeedAmount('');
    setFeedFood('');
    setFeedNote('');
  }, [feedType, feedTime, feedDuration, feedAmount, feedFood, feedNote, feedingRecords]);

  const addSleep = useCallback(() => {
    if (!sleepStart) {
      Alert.alert('提示', '请填写入睡时间');
      return;
    }
    const record: SleepRecord = {
      id: generateId(),
      startTime: sleepStart,
      endTime: sleepEnd || undefined,
      quality: sleepQuality,
      note: sleepNote || undefined,
    };
    const updated = [record, ...sleepRecords];
    setSleepRecords(updated);
    saveToStorage(SLEEP_KEY, updated);
    setShowSleepForm(false);
    setSleepEnd('');
    setSleepNote('');
  }, [sleepStart, sleepEnd, sleepQuality, sleepNote, sleepRecords]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFeedings = feedingRecords.filter((r) => r.startTime.startsWith(todayStr));
  const todaySleeps = sleepRecords.filter((r) => r.startTime.startsWith(todayStr));

  let totalSleepMinutes = 0;
  todaySleeps.forEach((s) => {
    if (s.endTime) {
      totalSleepMinutes += (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📅 今日统计</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayFeedings.length}</Text>
              <Text style={styles.statLabel}>喂养次数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{(totalSleepMinutes / 60).toFixed(1)}h</Text>
              <Text style={styles.statLabel}>睡眠时长</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {todayFeedings.filter((f) => f.type === 'breast').length}/
                {todayFeedings.filter((f) => f.type === 'bottle').length}
              </Text>
              <Text style={styles.statLabel}>母乳/奶瓶</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todaySleeps.length}</Text>
              <Text style={styles.statLabel}>睡眠次数</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'feeding' && styles.tabActive]}
            onPress={() => setActiveTab('feeding')}
          >
            <Ionicons name="nutrition" size={16} color={activeTab === 'feeding' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'feeding' && styles.tabTextActive]}>喂养记录</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sleep' && styles.tabActive]}
            onPress={() => setActiveTab('sleep')}
          >
            <Ionicons name="moon" size={16} color={activeTab === 'sleep' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'sleep' && styles.tabTextActive]}>睡眠记录</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'feeding' && (
          <>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setFeedTime(nowString());
                setShowFeedingForm(true);
              }}
            >
              <Ionicons name="add" size={18} color="#f5576c" />
              <Text style={[styles.addBtnText, { color: '#f5576c' }]}>记录喂养</Text>
            </TouchableOpacity>

            {feedingRecords.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🍼</Text>
                <Text style={styles.emptyText}>还没有喂养记录</Text>
              </View>
            ) : (
              feedingRecords.map((record) => (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordType}>{feedingTypeLabels[record.type]}</Text>
                    <Text style={styles.recordTime}>{formatDateTime(record.startTime)}</Text>
                  </View>
                  <View style={styles.recordDetails}>
                    {record.duration != null && <Text style={styles.detailText}>⏱️ {record.duration}分钟</Text>}
                    {record.amount != null && <Text style={styles.detailText}>💧 {record.amount}ml</Text>}
                    {record.food ? <Text style={styles.detailText}>🥄 {record.food}</Text> : null}
                  </View>
                  {record.note ? <Text style={styles.recordNote}>{record.note}</Text> : null}
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'sleep' && (
          <>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setSleepStart(nowString());
                setShowSleepForm(true);
              }}
            >
              <Ionicons name="add" size={18} color="#f5576c" />
              <Text style={[styles.addBtnText, { color: '#f5576c' }]}>记录睡眠</Text>
            </TouchableOpacity>

            {sleepRecords.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>💤</Text>
                <Text style={styles.emptyText}>还没有睡眠记录</Text>
              </View>
            ) : (
              sleepRecords.map((record) => (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordType}>{qualityLabels[record.quality || 'normal']}</Text>
                    <Text style={styles.recordTime}>{formatDateTime(record.startTime)}</Text>
                  </View>
                  <View style={styles.recordDetails}>
                    <Text style={styles.detailText}>⏱️ {getSleepDuration(record.startTime, record.endTime)}</Text>
                  </View>
                  {record.note ? <Text style={styles.recordNote}>{record.note}</Text> : null}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Feeding Modal */}
      <Modal visible={showFeedingForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>记录喂养</Text>
              <TouchableOpacity onPress={() => setShowFeedingForm(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>喂养方式</Text>
            <View style={styles.typeRow}>
              {(['breast', 'bottle', 'solid'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, feedType === t && styles.typeBtnActive]}
                  onPress={() => setFeedType(t)}
                >
                  <Text style={[styles.typeBtnText, feedType === t && styles.typeBtnTextActive]}>
                    {feedingTypeLabels[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>时间 (YYYY-MM-DD HH:MM)</Text>
            <TextInput style={styles.input} value={feedTime} onChangeText={setFeedTime} />
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>时长(分钟)</Text>
                <TextInput style={styles.input} value={feedDuration} onChangeText={setFeedDuration} keyboardType="number-pad" placeholder="选填" />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>奶量(ml)</Text>
                <TextInput style={styles.input} value={feedAmount} onChangeText={setFeedAmount} keyboardType="number-pad" placeholder="选填" />
              </View>
            </View>
            {feedType === 'solid' && (
              <>
                <Text style={styles.label}>食物种类</Text>
                <TextInput style={styles.input} value={feedFood} onChangeText={setFeedFood} placeholder="如：南瓜泥" />
              </>
            )}
            <Text style={styles.label}>备注</Text>
            <TextInput style={styles.input} value={feedNote} onChangeText={setFeedNote} placeholder="选填" />
            <TouchableOpacity style={styles.saveBtn} onPress={addFeeding}>
              <Text style={styles.saveBtnText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sleep Modal */}
      <Modal visible={showSleepForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>记录睡眠</Text>
              <TouchableOpacity onPress={() => setShowSleepForm(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>入睡时间 (YYYY-MM-DD HH:MM)</Text>
            <TextInput style={styles.input} value={sleepStart} onChangeText={setSleepStart} />
            <Text style={styles.label}>醒来时间 (选填)</Text>
            <TextInput style={styles.input} value={sleepEnd} onChangeText={setSleepEnd} placeholder="如 2024-06-01 08:00" />
            <Text style={styles.label}>睡眠质量</Text>
            <View style={styles.typeRow}>
              {(['good', 'normal', 'poor'] as const).map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.typeBtn, sleepQuality === q && styles.typeBtnActive]}
                  onPress={() => setSleepQuality(q)}
                >
                  <Text style={[styles.typeBtnText, sleepQuality === q && styles.typeBtnTextActive]}>
                    {qualityLabels[q]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>备注</Text>
            <TextInput style={styles.input} value={sleepNote} onChangeText={setSleepNote} placeholder="选填" />
            <TouchableOpacity style={styles.saveBtn} onPress={addSleep}>
              <Text style={styles.saveBtnText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  summaryCard: {
    backgroundColor: '#f5576c',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#e8e8e8',
  },
  tabActive: { backgroundColor: '#f5576c' },
  tabText: { fontSize: 14, color: '#666' },
  tabTextActive: { color: '#fff' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#f5576c',
    backgroundColor: 'rgba(245,87,108,0.05)',
    marginBottom: 16,
  },
  addBtnText: { fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 8 },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recordType: { fontSize: 14, fontWeight: '600' },
  recordTime: { fontSize: 12, color: '#999' },
  recordDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailText: { fontSize: 13, color: '#666' },
  recordNote: { marginTop: 8, fontSize: 13, color: '#666', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 14, color: '#666', marginBottom: 6, marginTop: 4 },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  formRow: { flexDirection: 'row', gap: 12 },
  formHalf: { flex: 1 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  typeBtnActive: { borderColor: '#f5576c', backgroundColor: 'rgba(245,87,108,0.08)' },
  typeBtnText: { fontSize: 13, color: '#666' },
  typeBtnTextActive: { color: '#f5576c' },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5576c',
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
