import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FeedingRecord, SleepRecord } from '../types';
import { formatDateTime, generateId, loadFromStorage, saveToStorage } from '../utils/storage';
import { colors, layout, radius, shadow, softShadow } from '../theme';

const FEEDING_KEY = 'baby-feeding-records';
const SLEEP_KEY = 'baby-sleep-records';

const feedingTypeLabels: Record<string, string> = { breast: '母乳', bottle: '奶瓶', solid: '辅食' };
const qualityLabels: Record<string, string> = { good: '好', normal: '一般', poor: '较差' };

function getSleepDuration(start: string, end?: string): string {
  if (!end) return '进行中';
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`;
  return `${minutes} 分钟`;
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
    Promise.all([loadFromStorage<FeedingRecord[]>(FEEDING_KEY, []), loadFromStorage<SleepRecord[]>(SLEEP_KEY, [])]).then(([f, s]) => {
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
  }, [feedAmount, feedDuration, feedFood, feedNote, feedTime, feedType, feedingRecords]);

  const addSleep = useCallback(() => {
    if (!sleepStart) {
      Alert.alert('提示', '请填写入睡时间');
      return;
    }
    const record: SleepRecord = { id: generateId(), startTime: sleepStart, endTime: sleepEnd || undefined, quality: sleepQuality, note: sleepNote || undefined };
    const updated = [record, ...sleepRecords];
    setSleepRecords(updated);
    saveToStorage(SLEEP_KEY, updated);
    setShowSleepForm(false);
    setSleepEnd('');
    setSleepNote('');
  }, [sleepEnd, sleepNote, sleepQuality, sleepRecords, sleepStart]);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const todayFeedings = feedingRecords.filter((r) => r.startTime.startsWith(todayStr));
  const todaySleeps = sleepRecords.filter((r) => r.startTime.startsWith(todayStr));
  const totalSleepMinutes = todaySleeps.reduce((sum, s) => sum + (s.endTime ? (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000 : 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>今日概览</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}><Text style={styles.statNumber}>{todayFeedings.length}</Text><Text style={styles.statLabel}>喂养次数</Text></View>
            <View style={styles.statItem}><Text style={styles.statNumber}>{(totalSleepMinutes / 60).toFixed(1)}h</Text><Text style={styles.statLabel}>睡眠时长</Text></View>
            <View style={styles.statItem}><Text style={styles.statNumber}>{todayFeedings.filter((f) => f.type === 'breast').length}/{todayFeedings.filter((f) => f.type === 'bottle').length}</Text><Text style={styles.statLabel}>母乳/奶瓶</Text></View>
            <View style={styles.statItem}><Text style={styles.statNumber}>{todaySleeps.length}</Text><Text style={styles.statLabel}>睡眠次数</Text></View>
          </View>
        </View>

        <View style={styles.tabBar}>
          {[
            { key: 'feeding' as const, label: '喂养记录', icon: 'nutrition' as const },
            { key: 'sleep' as const, label: '睡眠记录', icon: 'moon' as const },
          ].map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
              <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#fff' : colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'feeding' ? (
          <>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setFeedTime(nowString()); setShowFeedingForm(true); }}>
              <Ionicons name="add" size={18} color={colors.pink} /><Text style={[styles.addBtnText, { color: colors.pink }]}>记录喂养</Text>
            </TouchableOpacity>
            {feedingRecords.length === 0 ? <Empty icon="nutrition-outline" text="还没有喂养记录" /> : feedingRecords.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}><Text style={styles.recordType}>{feedingTypeLabels[record.type]}</Text><Text style={styles.recordTime}>{formatDateTime(record.startTime)}</Text></View>
                <View style={styles.recordDetails}>
                  {record.duration != null && <Text style={styles.detailText}>{record.duration} 分钟</Text>}
                  {record.amount != null && <Text style={styles.detailText}>{record.amount} ml</Text>}
                  {record.food ? <Text style={styles.detailText}>{record.food}</Text> : null}
                </View>
                {record.note ? <Text style={styles.recordNote}>{record.note}</Text> : null}
              </View>
            ))}
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setSleepStart(nowString()); setShowSleepForm(true); }}>
              <Ionicons name="add" size={18} color={colors.violet} /><Text style={[styles.addBtnText, { color: colors.violet }]}>记录睡眠</Text>
            </TouchableOpacity>
            {sleepRecords.length === 0 ? <Empty icon="moon-outline" text="还没有睡眠记录" /> : sleepRecords.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}><Text style={styles.recordType}>{qualityLabels[record.quality || 'normal']}</Text><Text style={styles.recordTime}>{formatDateTime(record.startTime)}</Text></View>
                <View style={styles.recordDetails}><Text style={styles.detailText}>{getSleepDuration(record.startTime, record.endTime)}</Text></View>
                {record.note ? <Text style={styles.recordNote}>{record.note}</Text> : null}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showFeedingForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <ModalHeader title="记录喂养" onClose={() => setShowFeedingForm(false)} />
          <Text style={styles.label}>喂养方式</Text>
          <View style={styles.optionRow}>{(['breast', 'bottle', 'solid'] as const).map((t) => <OptionButton key={t} label={feedingTypeLabels[t]} active={feedType === t} onPress={() => setFeedType(t)} />)}</View>
          <Text style={styles.label}>时间 (YYYY-MM-DD HH:MM)</Text><TextInput style={styles.input} value={feedTime} onChangeText={setFeedTime} />
          <View style={styles.formRow}><View style={styles.formHalf}><Text style={styles.label}>时长(分钟)</Text><TextInput style={styles.input} value={feedDuration} onChangeText={setFeedDuration} keyboardType="number-pad" placeholder="选填" /></View><View style={styles.formHalf}><Text style={styles.label}>奶量(ml)</Text><TextInput style={styles.input} value={feedAmount} onChangeText={setFeedAmount} keyboardType="number-pad" placeholder="选填" /></View></View>
          {feedType === 'solid' && <><Text style={styles.label}>食物种类</Text><TextInput style={styles.input} value={feedFood} onChangeText={setFeedFood} placeholder="例如 南瓜泥" /></>}
          <Text style={styles.label}>备注</Text><TextInput style={styles.input} value={feedNote} onChangeText={setFeedNote} placeholder="选填" />
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.pink }]} onPress={addFeeding}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={showSleepForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <ModalHeader title="记录睡眠" onClose={() => setShowSleepForm(false)} />
          <Text style={styles.label}>入睡时间 (YYYY-MM-DD HH:MM)</Text><TextInput style={styles.input} value={sleepStart} onChangeText={setSleepStart} />
          <Text style={styles.label}>醒来时间 (选填)</Text><TextInput style={styles.input} value={sleepEnd} onChangeText={setSleepEnd} placeholder="例如 2024-06-01 08:00" />
          <Text style={styles.label}>睡眠质量</Text>
          <View style={styles.optionRow}>{(['good', 'normal', 'poor'] as const).map((q) => <OptionButton key={q} label={qualityLabels[q]} active={sleepQuality === q} onPress={() => setSleepQuality(q)} />)}</View>
          <Text style={styles.label}>备注</Text><TextInput style={styles.input} value={sleepNote} onChangeText={setSleepNote} placeholder="选填" />
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.violet }]} onPress={addSleep}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  );
}

function Empty({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return <View style={styles.empty}><Ionicons name={icon} size={42} color={colors.textSubtle} /><Text style={styles.emptyText}>{text}</Text></View>;
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return <View style={styles.modalHeader}><Text style={styles.modalTitle}>{title}</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity></View>;
}

function OptionButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <TouchableOpacity style={[styles.optionBtn, active && styles.optionBtnActive]} onPress={onPress}><Text style={[styles.optionBtnText, active && styles.optionBtnTextActive]}>{label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  scrollContent: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: layout.pagePadding, paddingBottom: 34 },
  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.lineSoft, ...shadow },
  summaryTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { width: '47%', backgroundColor: '#f6f8fc', borderRadius: radius.lg, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: colors.lineSoft },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 3, fontWeight: '700' },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16, backgroundColor: '#e9edf5', padding: 4, borderRadius: 17 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 13 },
  tabActive: { backgroundColor: colors.pink },
  tabText: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: colors.surfaceSolid, marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 42 },
  emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 10, fontWeight: '800' },
  recordCard: { backgroundColor: colors.surfaceSolid, borderRadius: radius.lg, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: colors.lineSoft, ...softShadow },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  recordType: { fontSize: 15, fontWeight: '800', color: colors.text },
  recordTime: { fontSize: 12, color: colors.textSubtle, fontWeight: '700' },
  recordDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailText: { fontSize: 13, color: colors.textMuted, backgroundColor: '#f6f8fc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontWeight: '700' },
  recordNote: { marginTop: 10, fontSize: 13, color: colors.textMuted, borderTopWidth: 1, borderTopColor: colors.lineSoft, paddingTop: 9 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.36)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surfaceSolid, borderRadius: radius.xl, padding: 20, maxHeight: '85%', ...shadow },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, marginTop: 4, fontWeight: '700' },
  input: { paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, fontSize: 14, marginBottom: 9, backgroundColor: '#fbfcff', color: colors.text },
  formRow: { flexDirection: 'row', gap: 12 },
  formHalf: { flex: 1 },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: 9 },
  optionBtn: { flex: 1, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', backgroundColor: '#fbfcff' },
  optionBtnActive: { borderColor: colors.pink, backgroundColor: '#fff0f4' },
  optionBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: '700' },
  optionBtnTextActive: { color: colors.pink },
  saveBtn: { paddingVertical: 13, borderRadius: radius.lg, alignItems: 'center', marginTop: 12 },
  saveBtnText: { fontSize: 16, color: '#fff', fontWeight: '800' },
});
