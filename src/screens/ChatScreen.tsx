import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ChatMessage } from '../types';
import { getAIResponse } from '../data/aiKnowledge';
import { getAssistantResponse, type AssistantChatMessage } from '../services/aiAssistant';
import { loadFromStorage, saveToStorage, generateId } from '../utils/storage';

const STORAGE_KEY = 'baby-chat-messages';

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '你好，我是小芽。\n\n' +
    '把宝宝的月龄、症状或喂养情况告诉我，我会尽量给出清晰、温和、可执行的建议。涉及急症或持续异常时，请及时联系儿科医生。',
  timestamp: new Date().toISOString(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [answerSource, setAnswerSource] = useState<'online' | 'local' | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFromStorage<ChatMessage[]>(STORAGE_KEY, [welcomeMessage]).then((saved) => {
      if (saved.length === 0) {
        setMessages([welcomeMessage]);
        return;
      }

      setMessages(saved.map((message) => (message.id === 'welcome' ? welcomeMessage : message)));
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
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const responseText = await getAssistantResponse(text, history);
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setAnswerSource('online');
    } catch (error) {
      const fallbackText =
        getAIResponse(text) +
        '\n\n（小芽暂时切到离线参考模式。你可以继续提问，稍后再试在线回答。）';
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setAnswerSource('local');
      console.warn('Assistant request failed, used local fallback:', error);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages]);

  const quickQuestions = [
    '宝宝发烧怎么办？',
    '什么时候加辅食？',
    '宝宝不睡觉怎么办？',
    '母乳喂养注意事项',
  ];

  const renderHeader = () => (
    <View style={styles.heroPanel}>
      <View style={styles.heroTop}>
        <View style={styles.brandMark}>
          <Ionicons name="leaf" size={20} color="#1f7a63" />
        </View>
        <View style={styles.heroTitleArea}>
          <Text style={styles.heroTitle}>小芽育儿</Text>
          <Text style={styles.heroSubtitle}>把担心说清楚，把下一步变简单</Text>
        </View>
      </View>
      <View style={styles.metricRow}>
        <View style={styles.metricItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#1f7a63" />
          <Text style={styles.metricText}>健康建议</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="restaurant-outline" size={16} color="#d97745" />
          <Text style={styles.metricText}>喂养辅食</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="moon-outline" size={16} color="#5967b2" />
          <Text style={styles.metricText}>睡眠作息</Text>
        </View>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageRow, item.role === 'user' && styles.messageRowUser]}>
      <View style={[styles.avatar, item.role === 'user' && styles.avatarUser]}>
        {item.role === 'assistant' ? (
          <Ionicons name="leaf" size={16} color="#1f7a63" />
        ) : (
          <Ionicons name="person" size={16} color="#5967b2" />
        )}
      </View>
      <View
        style={[
          styles.bubble,
          item.role === 'assistant' ? styles.bubbleAssistant : styles.bubbleUser,
        ]}
      >
        <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
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
            <View style={[styles.messageRow]}>
              <View style={styles.avatar}>
                <Ionicons name="leaf" size={16} color="#1f7a63" />
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
          <View
            style={[
              styles.sourceBadge,
              answerSource === 'online' ? styles.sourceBadgeOnline : styles.sourceBadgeLocal,
            ]}
          >
            <Text
              style={[
                styles.sourceBadgeText,
                answerSource === 'online'
                  ? styles.sourceBadgeTextOnline
                  : styles.sourceBadgeTextLocal,
              ]}
            >
              {answerSource === 'online' ? '在线回答' : '离线参考'}
            </Text>
          </View>
        )}
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="输入你的育儿问题..."
          placeholderTextColor="#aaa"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  messagesList: {
    padding: 18,
    paddingBottom: 10,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  heroPanel: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6eadf',
    marginBottom: 18,
    shadowColor: '#274238',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e8f4ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleArea: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#24352f',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#69776f',
    marginTop: 3,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f4f6f0',
  },
  metricText: {
    fontSize: 12,
    color: '#4f5f56',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e8f4ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#d8e8df',
  },
  avatarUser: {
    backgroundColor: '#eef1ff',
    borderColor: '#dfe3ff',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
  },
  bubbleAssistant: {
    backgroundColor: '#fff',
    borderColor: '#e6eadf',
  },
  bubbleUser: {
    backgroundColor: '#5967b2',
    borderColor: '#5967b2',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 23,
    color: '#26352f',
  },
  bubbleTextUser: {
    color: '#fff',
  },
  typingText: {
    fontSize: 14,
    color: '#69776f',
  },
  quickContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 8,
  },
  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e8df',
    backgroundColor: '#fff',
  },
  quickBtnText: {
    fontSize: 13,
    color: '#1f7a63',
    fontWeight: '600',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#f7f8f4',
    borderTopWidth: 1,
    borderTopColor: '#e6eadf',
    gap: 8,
  },
  sourceBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sourceBadgeOnline: {
    backgroundColor: '#e8f4ee',
  },
  sourceBadgeLocal: {
    backgroundColor: '#fff1e8',
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sourceBadgeTextOnline: {
    color: '#1f7a63',
  },
  sourceBadgeTextLocal: {
    color: '#c45d2d',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe5da',
    backgroundColor: '#fff',
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1f7a63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
