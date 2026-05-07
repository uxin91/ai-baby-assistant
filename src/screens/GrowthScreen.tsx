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
import type { GrowthRecord, Milestone, Baby } from '../types';
import { defaultMilestones } from '../data/milestones';
import { loadFromStorage, saveToStorage, generateId, formatDate, getAgeText } from '../utils/storage';

const BABY_KEY = 'baby-info';
const GROWTH_KEY = 'baby-growth-records';
const MILESTONE_KEY = 'baby-milestones';

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
      loadFromStorage<Milestone[]>(
        MILESTONE_KEY,
        defaultMilestones.map((m, i) => ({ ...m, id: `ms-${i}` }))
      ),
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
    const newBaby: Baby = {
      id: baby?.id || generateId(),
      name: babyName.trim(),
      birthday: babyBirthday,
      gender: babyGender,
    };
    setBaby(newBaby);
    saveToStorage(BABY_KEY, newBaby);
    setShowBabyForm(false);
  }, [baby, babyName, babyBirthday, babyGender]);

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
  }, [recordDate, recordHeight, recordWeight, recordHead, recordNote, records]);

  const toggleMilestone = useCallback(
    (id: string) => {
      const updated = milestones.map((m) =>
        m.id === id
          ? { ...m, achievedDate: m.achievedDate ? undefined : new Date().toISOString() }
          : m
      );
      setMilestones(updated);
      saveToStorage(MILESTONE_KEY, updated);
    },
    [milestones]
  );

  const categoryLabels: Record<string, string> = {
    motor: '🏃 大运动/精细运动',
    language: '🗣️ 语言',
    social: '🤝 社交',
    cognitive: '🧠 认知',
  };

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
              <Text style={styles.babyAvatarText}>{baby.gender === 'male' ? '👦' : '👧'}</Text>
            </View>
            <View style={styles.babyInfo}>
              <Text style={styles.babyName}>{baby.name}</Text>
              <Text style={styles.babyAge}>{getAgeText(baby.birthday)}</Text>
            </View>
            <Text style={styles.babyEdit}>编辑</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'growth' && styles.tabActive]}
            onPress={() => setActiveTab('growth')}
          >
            <Ionicons name="trending-up" size={16} color={activeTab === 'growth' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'growth' && styles.tabTextActive]}>
              生长记录
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'milestone' && styles.tabActive]}
            onPress={() => setActiveTab('milestone')}
          >
            <Ionicons name="trophy" size={16} color={activeTab === 'milestone' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'milestone' && styles.tabTextActive]}>
              发育里程碑
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'growth' && (
          <>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowRecordForm(true)}>
              <Ionicons name="add" size={18} color="#667eea" />
              <Text style={styles.addBtnText}>添加记录</Text>
            </TouchableOpacity>

            {records.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyText}>还没有生长记录</Text>
                <Text style={styles.emptySubText}>点击上方按钮开始记录宝宝的成长数据</Text>
              </View>
            ) : (
              records.map((record) => (
                <View key={record.id} style={styles.recordCard}>
                  <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                  <View style={styles.recordData}>
                    {record.height != null && <Text style={styles.dataItem}>📏 {record.height} cm</Text>}
                    {record.weight != null && <Text style={styles.dataItem}>⚖️ {record.weight} kg</Text>}
                    {record.headCircumference != null && (
                      <Text style={styles.dataItem}>🔵 头围 {record.headCircumference} cm</Text>
                    )}
                  </View>
                  {record.note ? <Text style={styles.recordNote}>{record.note}</Text> : null}
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'milestone' && (
          <>
            {Object.entries(categoryLabels).map(([category, label]) => (
              <View key={category} style={styles.milestoneCategory}>
                <Text style={styles.categoryTitle}>{label}</Text>
                {milestones
                  .filter((m) => m.category === category)
                  .map((milestone) => (
                    <TouchableOpacity
                      key={milestone.id}
                      style={[styles.milestoneItem, milestone.achievedDate && styles.milestoneAchieved]}
                      onPress={() => toggleMilestone(milestone.id)}
                    >
                      <Text style={styles.milestoneCheck}>
                        {milestone.achievedDate ? '✅' : '⬜'}
                      </Text>
                      <View style={styles.milestoneInfo}>
                        <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                        <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                        <Text style={styles.milestoneAge}>参考月龄: {milestone.ageMonths}个月</Text>
                        {milestone.achievedDate && (
                          <Text style={styles.milestoneDate}>
                            达成于 {formatDate(milestone.achievedDate)}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Baby Form Modal */}
      <Modal visible={showBabyForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👶 设置宝宝信息</Text>
              {baby && (
                <TouchableOpacity onPress={() => setShowBabyForm(false)}>
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.label}>宝宝昵称</Text>
            <TextInput style={styles.input} value={babyName} onChangeText={setBabyName} placeholder="输入宝宝昵称" />
            <Text style={styles.label}>出生日期 (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={babyBirthday}
              onChangeText={setBabyBirthday}
              placeholder="如 2024-06-01"
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.label}>性别</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, babyGender === 'male' && styles.genderBtnActive]}
                onPress={() => setBabyGender('male')}
              >
                <Text style={[styles.genderBtnText, babyGender === 'male' && styles.genderBtnTextActive]}>
                  👦 男宝
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, babyGender === 'female' && styles.genderBtnActive]}
                onPress={() => setBabyGender('female')}
              >
                <Text style={[styles.genderBtnText, babyGender === 'female' && styles.genderBtnTextActive]}>
                  👧 女宝
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveBaby}>
              <Text style={styles.saveBtnText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Record Form Modal */}
      <Modal visible={showRecordForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加生长记录</Text>
              <TouchableOpacity onPress={() => setShowRecordForm(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>日期 (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={recordDate} onChangeText={setRecordDate} />
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>身高 (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={recordHeight}
                  onChangeText={setRecordHeight}
                  placeholder="如 65.5"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>体重 (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={recordWeight}
                  onChangeText={setRecordWeight}
                  placeholder="如 7.2"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <Text style={styles.label}>头围 (cm) 选填</Text>
            <TextInput
              style={styles.input}
              value={recordHead}
              onChangeText={setRecordHead}
              placeholder="选填"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>备注</Text>
            <TextInput style={styles.input} value={recordNote} onChangeText={setRecordNote} placeholder="选填" />
            <TouchableOpacity style={styles.saveBtn} onPress={addRecord}>
              <Text style={styles.saveBtnText}>保存记录</Text>
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
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#667eea',
    borderRadius: 16,
    marginBottom: 16,
  },
  babyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyAvatarText: { fontSize: 30 },
  babyInfo: { flex: 1, marginLeft: 12 },
  babyName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  babyAge: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  babyEdit: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
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
  tabActive: { backgroundColor: '#667eea' },
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
    borderColor: '#667eea',
    backgroundColor: 'rgba(102,126,234,0.05)',
    marginBottom: 16,
  },
  addBtnText: { fontSize: 14, color: '#667eea' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 8 },
  emptySubText: { fontSize: 14, color: '#bbb', marginTop: 4 },
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
  recordDate: { fontSize: 13, color: '#999', marginBottom: 8 },
  recordData: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  dataItem: { fontSize: 14, color: '#333', fontWeight: '500' },
  recordNote: { marginTop: 8, fontSize: 13, color: '#666', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  milestoneCategory: { marginBottom: 20 },
  categoryTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
  milestoneItem: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  milestoneAchieved: { backgroundColor: 'rgba(102,126,234,0.05)' },
  milestoneCheck: { fontSize: 20 },
  milestoneInfo: { flex: 1 },
  milestoneTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  milestoneDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  milestoneAge: { fontSize: 12, color: '#999', marginTop: 4 },
  milestoneDate: { fontSize: 12, color: '#667eea', marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
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
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  genderBtnActive: { borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.08)' },
  genderBtnText: { fontSize: 14, color: '#666' },
  genderBtnTextActive: { color: '#667eea' },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
