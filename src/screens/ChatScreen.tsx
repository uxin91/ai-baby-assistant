import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ChatMessage } from '../types';
import { getAIResponse } from '../data/aiKnowledge';
import { getAssistantResponse, type AssistantChatMessage } from '../services/aiAssistant';
import { generateId, loadFromStorage, saveToStorage } from '../utils/storage';
import { colors, layout, radius, shadow, softShadow } from '../theme';

const STORAGE_KEY = 'baby-chat-messages';

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '你好，我是小芽。\n\n把宝宝的月龄、症状、喂养或睡眠情况告诉我，我会尽量给出清晰、温和、可执行的建议。遇到急症或持续异常，请及时联系儿科医生。',
  timestamp: new Date().toISOString(),
};

const quickQuestions = ['宝宝发烧怎么办？', '什么时候加辅食？', '宝宝不睡觉怎么办？', '母乳喂养注意事项'];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [answerSource, setAnswerSource] = useState<'online' | 'local' | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFromStorage<ChatMessage[]>(STORAGE_KEY, [welcomeMessage]).then((saved) => {
      setMessages(saved.length === 0 ? [welcomeMessage] : saved.map((message) => (message.id === 'welcome' ? welcomeMessage : message)));
    });
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      saveToStorage(STORAGE_KEY, messages);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history: AssistantChatMessage[] = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      const responseText = await getAssistantResponse(text, history);
      setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: responseText, timestamp: new Date().toISOString() }]);
      setAnswerSource('online');
    } catch (error) {
      const fallbackText = `${getAIResponse(text)}\n\n（小芽暂时切到离线参考模式。你可以继续提问，稍后再试在线回答。）`;
      setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: fallbackText, timestamp: new Date().toISOString() }]);
      setAnswerSource('local');
      console.warn('Assistant request failed, used local fallback:', error);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages]);

  const renderHeader = () => (
    <View style={styles.heroPanel}>
      <View style={styles.heroTop}>
        <View style={styles.brandMark}>
          <Ionicons name="sparkles" size={22} color={colors.blue} />
        </View>
        <View style={styles.heroTitleArea}>
          <Text style={styles.heroTitle}>小芽育儿</Text>
          <Text style={styles.heroSubtitle}>把担心说清楚，把下一步变简单。</Text>
        </View>
      </View>
      <View style={styles.metricRow}>
        <View style={styles.metricItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.mint} />
          <Text style={styles.metricText}>健康建议</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="restaurant-outline" size={16} color={colors.orange} />
          <Text style={styles.metricText}>喂养辅食</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="moon-outline" size={16} color={colors.violet} />
          <Text style={styles.metricText}>睡眠作息</Text>
        </View>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageRow, item.role === 'user' && styles.messageRowUser]}>
      <View style={[styles.avatar, item.role === 'user' && styles.avatarUser]}>
        <Ionicons name={item.role === 'assistant' ? 'sparkles' : 'person'} size={15} color={item.role === 'assistant' ? colors.blue : colors.violet} />
      </View>
      <View style={[styles.bubble, item.role === 'assistant' ? styles.bubbleAssistant : styles.bubbleUser]}>
        <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.messageRow}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={15} color={colors.blue} />
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <Text style={styles.typingText}>小芽正在整理建议...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {messages.length <= 1 && (
        <View style={styles.quickContainer}>
          {quickQuestions.map((q) => (
            <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => setInput(q)}>
              <Text style={styles.quickBtnText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.inputArea}>
        {answerSource && (
          <View style={[styles.sourceBadge, answerSource === 'online' ? styles.sourceBadgeOnline : styles.sourceBadgeLocal]}>
            <Text style={[styles.sourceBadgeText, answerSource === 'online' ? styles.sourceBadgeTextOnline : styles.sourceBadgeTextLocal]}>
              {answerSource === 'online' ? '在线' : '离线'}
            </Text>
          </View>
        )}
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="输入你的育儿问题..."
          placeholderTextColor={colors.textSubtle}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]} onPress={handleSend} disabled={!input.trim() || isTyping}>
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  messagesList: { padding: layout.pagePadding, paddingBottom: 10, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center' },
  heroPanel: {
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    marginBottom: 18,
    ...shadow,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#e8f2ff', alignItems: 'center', justifyContent: 'center' },
  heroTitleArea: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  heroSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: '#f6f8fc' },
  metricText: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  messageRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatar: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#e8f2ff', alignItems: 'center', justifyContent: 'center', marginHorizontal: 6, borderWidth: 1, borderColor: '#d9e9ff' },
  avatarUser: { backgroundColor: '#f0edff', borderColor: '#e3defd' },
  bubble: { maxWidth: '78%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20, borderWidth: 1 },
  bubbleAssistant: { backgroundColor: colors.surfaceSolid, borderColor: colors.lineSoft, ...softShadow },
  bubbleUser: { backgroundColor: colors.blue, borderColor: colors.blue },
  bubbleText: { fontSize: 15, lineHeight: 23, color: colors.text },
  bubbleTextUser: { color: '#fff' },
  typingText: { fontSize: 14, color: colors.textMuted },
  quickContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 10, gap: 8 },
  quickBtn: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: colors.surfaceSolid },
  quickBtnText: { fontSize: 13, color: colors.blue, fontWeight: '700' },
  inputArea: { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 12, backgroundColor: colors.canvas, borderTopWidth: 1, borderTopColor: colors.lineSoft, gap: 8 },
  sourceBadge: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999 },
  sourceBadgeOnline: { backgroundColor: '#e8f2ff' },
  sourceBadgeLocal: { backgroundColor: '#fff3df' },
  sourceBadgeText: { fontSize: 11, fontWeight: '800' },
  sourceBadgeTextOnline: { color: colors.blue },
  sourceBadgeTextLocal: { color: '#b56a00' },
  textInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 18, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: colors.surfaceSolid, fontSize: 15, color: colors.text },
  sendBtn: { width: 42, height: 42, borderRadius: 16, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', ...softShadow },
  sendBtnDisabled: { opacity: 0.45 },
});
