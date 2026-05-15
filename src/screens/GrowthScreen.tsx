import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Baby, GrowthRecord, Milestone } from '../types';
import { defaultMilestones } from '../data/milestones';
import { formatDate, generateId, getAgeText, loadFromStorage, saveToStorage } from '../utils/storage';
import { colors, layout, radius, shadow, softShadow } from '../theme';

const BABY_KEY = 'baby-info';
const GROWTH_KEY = 'baby-growth-records';
const MILESTONE_KEY = 'baby-milestones';

const categoryLabels: Record<string, string> = {
  motor: '大运动与精细运动',
  language: '语言',
  social: '社交',
  cognitive: '认知',
};

export default function GrowthScreen() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showBabyForm, setShowBabyForm] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'growth' | 'milestone'>('growth');
  const [loaded, setLoaded] = useState(false);

  const [babyName, setBabyName] = useState('');
  const [babyBirthday, setBabyBirthday] = useState('');
  const [babyGender, setBabyGender] = useState<'male' | 'female'>('male');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordHeight, setRecordHeight] = useState('');
  const [recordWeight, setRecordWeight] = useState('');
  const [recordHead, setRecordHead] = useState('');
  const [recordNote, setRecordNote] = useState('');

  useEffect(() => {
    Promise.all([
      loadFromStorage<Baby | null>(BABY_KEY, null),
      loadFromStorage<GrowthRecord[]>(GROWTH_KEY, []),
      loadFromStorage<Milestone[]>(MILESTONE_KEY, defaultMilestones.map((m, i) => ({ ...m, id: `ms-${i}` }))),
    ]).then(([b, g, m]) => {
      setBaby(b);
      setRecords(g);
      setMilestones(m);
      if (!b) setShowBabyForm(true);
      setLoaded(true);
    });
  }, []);

  const saveBaby = useCallback(() => {
    if (!babyName.trim()) {
      Alert.alert('提示', '请输入宝宝昵称');
      return;
    }
    if (!babyBirthday.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(babyBirthday)) {
      Alert.alert('提示', '请输入正确的出生日期，格式：YYYY-MM-DD');
      return;
    }
    const newBaby: Baby = { id: baby?.id || generateId(), name: babyName.trim(), birthday: babyBirthday, gender: babyGender };
    setBaby(newBaby);
    saveToStorage(BABY_KEY, newBaby);
    setShowBabyForm(false);
  }, [baby, babyBirthday, babyGender, babyName]);

  const addRecord = useCallback(() => {
    if (!recordHeight && !recordWeight) {
      Alert.alert('提示', '请至少填写身高或体重');
      return;
    }
    const newRecord: GrowthRecord = {
      id: generateId(),
      date: recordDate,
      height: recordHeight ? parseFloat(recordHeight) : undefined,
      weight: recordWeight ? parseFloat(recordWeight) : undefined,
      headCircumference: recordHead ? parseFloat(recordHead) : undefined,
      note: recordNote || undefined,
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    saveToStorage(GROWTH_KEY, updated);
    setShowRecordForm(false);
    setRecordHeight('');
    setRecordWeight('');
    setRecordHead('');
    setRecordNote('');
  }, [recordDate, recordHead, recordHeight, recordNote, recordWeight, records]);

  const toggleMilestone = useCallback((id: string) => {
    const updated = milestones.map((m) => (m.id === id ? { ...m, achievedDate: m.achievedDate ? undefined : new Date().toISOString() } : m));
    setMilestones(updated);
    saveToStorage(MILESTONE_KEY, updated);
  }, [milestones]);

  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {baby && (
          <TouchableOpacity
            style={styles.babyCard}
            onPress={() => {
              setBabyName(baby.name);
              setBabyBirthday(baby.birthday);
              setBabyGender(baby.gender);
              setShowBabyForm(true);
            }}
          >
            <View style={styles.babyAvatar}>
              <Ionicons name={baby.gender === 'male' ? 'happy' : 'flower'} size={24} color={colors.violet} />
            </View>
            <View style={styles.babyInfo}>
              <Text style={styles.babyName}>{baby.name}</Text>
              <Text style={styles.babyAge}>{getAgeText(baby.birthday)}</Text>
            </View>
            <View style={styles.editPill}><Text style={styles.editPillText}>编辑</Text></View>
          </TouchableOpacity>
        )}

        <View style={styles.tabBar}>
          {[
            { key: 'growth' as const, label: '生长记录', icon: 'trending-up' as const },
            { key: 'milestone' as const, label: '发育里程碑', icon: 'trophy' as const },
          ].map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
              <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#fff' : colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'growth' ? (
          <>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowRecordForm(true)}>
              <Ionicons name="add" size={18} color={colors.blue} />
              <Text style={styles.addBtnText}>添加记录</Text>
            </TouchableOpacity>
            {records.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="analytics-outline" size={42} color={colors.textSubtle} />
                <Text style={styles.emptyText}>还没有生长记录</Text>
                <Text style={styles.emptySubText}>记录身高、体重和头围，慢慢看见成长曲线。</Text>
              </View>
            ) : records.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                <View style={styles.recordData}>
                  {record.height != null && <Text style={styles.dataItem}>身高 {record.height} cm</Text>}
                  {record.weight != null && <Text style={styles.dataItem}>体重 {record.weight} kg</Text>}
                  {record.headCircumference != null && <Text style={styles.dataItem}>头围 {record.headCircumference} cm</Text>}
                </View>
                {record.note ? <Text style={styles.recordNote}>{record.note}</Text> : null}
              </View>
            ))}
          </>
        ) : (
          Object.entries(categoryLabels).map(([category, label]) => (
            <View key={category} style={styles.milestoneCategory}>
              <Text style={styles.categoryTitle}>{label}</Text>
              {milestones.filter((m) => m.category === category).map((milestone) => (
                <TouchableOpacity key={milestone.id} style={[styles.milestoneItem, milestone.achievedDate && styles.milestoneAchieved]} onPress={() => toggleMilestone(milestone.id)}>
                  <View style={[styles.checkDot, milestone.achievedDate && styles.checkDotDone]}>
                    <Ionicons name={milestone.achievedDate ? 'checkmark' : 'ellipse-outline'} size={16} color={milestone.achievedDate ? '#fff' : colors.textSubtle} />
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                    <Text style={styles.milestoneAge}>参考月龄 {milestone.ageMonths} 个月</Text>
                    {milestone.achievedDate && <Text style={styles.milestoneDate}>达成于 {formatDate(milestone.achievedDate)}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showBabyForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>设置宝宝信息</Text>
              {baby && <TouchableOpacity onPress={() => setShowBabyForm(false)}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity>}
            </View>
            <Text style={styles.label}>宝宝昵称</Text>
            <TextInput style={styles.input} value={babyName} onChangeText={setBabyName} placeholder="输入宝宝昵称" />
            <Text style={styles.label}>出生日期 (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={babyBirthday} onChangeText={setBabyBirthday} placeholder="例如 2024-06-01" keyboardType="numbers-and-punctuation" />
            <Text style={styles.label}>性别</Text>
            <View style={styles.optionRow}>
              {[
                { key: 'male' as const, label: '男宝' },
                { key: 'female' as const, label: '女宝' },
              ].map((item) => (
                <TouchableOpacity key={item.key} style={[styles.optionBtn, babyGender === item.key && styles.optionBtnActive]} onPress={() => setBabyGender(item.key)}>
                  <Text style={[styles.optionBtnText, babyGender === item.key && styles.optionBtnTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveBaby}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRecordForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加生长记录</Text>
              <TouchableOpacity onPress={() => setShowRecordForm(false)}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <Text style={styles.label}>日期 (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={recordDate} onChangeText={setRecordDate} />
            <View style={styles.formRow}>
              <View style={styles.formHalf}><Text style={styles.label}>身高 (cm)</Text><TextInput style={styles.input} value={recordHeight} onChangeText={setRecordHeight} placeholder="65.5" keyboardType="decimal-pad" /></View>
              <View style={styles.formHalf}><Text style={styles.label}>体重 (kg)</Text><TextInput style={styles.input} value={recordWeight} onChangeText={setRecordWeight} placeholder="7.2" keyboardType="decimal-pad" /></View>
            </View>
            <Text style={styles.label}>头围 (cm) 选填</Text>
            <TextInput style={styles.input} value={recordHead} onChangeText={setRecordHead} placeholder="选填" keyboardType="decimal-pad" />
            <Text style={styles.label}>备注</Text>
            <TextInput style={styles.input} value={recordNote} onChangeText={setRecordNote} placeholder="选填" />
            <TouchableOpacity style={styles.saveBtn} onPress={addRecord}><Text style={styles.saveBtnText}>保存记录</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  scrollContent: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: layout.pagePadding, paddingBottom: 34 },
  babyCard: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: 16, borderWidth: 1, borderColor: colors.lineSoft, ...shadow },
  babyAvatar: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#f0edff', alignItems: 'center', justifyContent: 'center' },
  babyInfo: { flex: 1, marginLeft: 13 },
  babyName: { fontSize: 20, fontWeight: '800', color: colors.text },
  babyAge: { fontSize: 14, color: colors.textMuted, marginTop: 3 },
  editPill: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: '#f8fafc' },
  editPillText: { fontSize: 12, color: colors.textMuted, fontWeight: '800' },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16, backgroundColor: '#e9edf5', padding: 4, borderRadius: 17 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 13 },
  tabActive: { backgroundColor: colors.blue },
  tabText: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: radius.lg, borderWidth: 1, borderColor: '#cfe5ff', backgroundColor: '#eef6ff', marginBottom: 16 },
  addBtnText: { fontSize: 14, color: colors.blue, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, color: colors.textMuted, marginTop: 10, fontWeight: '800' },
  emptySubText: { fontSize: 14, color: colors.textSubtle, marginTop: 5, textAlign: 'center' },
  recordCard: { backgroundColor: colors.surfaceSolid, borderRadius: radius.lg, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: colors.lineSoft, ...softShadow },
  recordDate: { fontSize: 13, color: colors.textSubtle, marginBottom: 9, fontWeight: '700' },
  recordData: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dataItem: { fontSize: 14, color: colors.text, fontWeight: '700', backgroundColor: '#f6f8fc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  recordNote: { marginTop: 10, fontSize: 13, color: colors.textMuted, borderTopWidth: 1, borderTopColor: colors.lineSoft, paddingTop: 9 },
  milestoneCategory: { marginBottom: 20 },
  categoryTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 10 },
  milestoneItem: { flexDirection: 'row', gap: 11, padding: 13, backgroundColor: colors.surfaceSolid, borderRadius: radius.lg, marginBottom: 8, borderWidth: 1, borderColor: colors.lineSoft, ...softShadow },
  milestoneAchieved: { backgroundColor: '#eef6ff', borderColor: '#cfe5ff' },
  checkDot: { width: 28, height: 28, borderRadius: 11, backgroundColor: '#f6f8fc', alignItems: 'center', justifyContent: 'center' },
  checkDotDone: { backgroundColor: colors.blue },
  milestoneInfo: { flex: 1 },
  milestoneTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  milestoneDesc: { fontSize: 13, color: colors.textMuted, marginTop: 3, lineHeight: 19 },
  milestoneAge: { fontSize: 12, color: colors.textSubtle, marginTop: 5, fontWeight: '700' },
  milestoneDate: { fontSize: 12, color: colors.blue, marginTop: 3, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.36)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surfaceSolid, borderRadius: radius.xl, padding: 20, maxHeight: '82%', ...shadow },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, marginTop: 4, fontWeight: '700' },
  input: { paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, fontSize: 14, marginBottom: 9, backgroundColor: '#fbfcff', color: colors.text },
  formRow: { flexDirection: 'row', gap: 12 },
  formHalf: { flex: 1 },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  optionBtn: { flex: 1, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', backgroundColor: '#fbfcff' },
  optionBtnActive: { borderColor: colors.blue, backgroundColor: '#eef6ff' },
  optionBtnText: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },
  optionBtnTextActive: { color: colors.blue },
  saveBtn: { paddingVertical: 13, borderRadius: radius.lg, backgroundColor: colors.blue, alignItems: 'center', marginTop: 12 },
  saveBtnText: { fontSize: 16, color: '#fff', fontWeight: '800' },
});
