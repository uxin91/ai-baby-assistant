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
import { loadFromStorage, saveToStorage, generateId } from '../utils/storage';

const STORAGE_KEY = 'baby-chat-messages';

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '你好！我是你的AI育儿助手\n\n' +
    '我可以帮你解答关于宝宝健康、喂养、睡眠、发育等方面的问题。\n\n' +
    '试试问我：\n' +
    '· 宝宝发烧怎么办？\n' +
    '· 什么时候开始加辅食？\n' +
    '· 宝宝不睡觉怎么办？',
  timestamp: new Date().toISOString(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFromStorage<ChatMessage[]>(STORAGE_KEY, [welcomeMessage]).then(setMessages);
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      saveToStorage(STORAGE_KEY, messages);
    }
  }, [messages]);

  const handleSend = useCallback(() => {
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

    setTimeout(() => {
      const response = getAIResponse(text);
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  }, [input, isTyping]);

  const quickQuestions = [
    '宝宝发烧怎么办？',
    '什么时候加辅食？',
    '宝宝不睡觉怎么办？',
    '母乳喂养注意事项',
  ];

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageRow, item.role === 'user' && styles.messageRowUser]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.role === 'assistant' ? '🤖' : '👤'}</Text>
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
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.messageRow]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <Text style={styles.typingText}>正在输入...</Text>
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
    backgroundColor: '#f0f2f5',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    fontSize: 18,
  },
  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleAssistant: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#667eea',
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  bubbleTextUser: {
    color: '#fff',
  },
  typingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  quickContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#667eea',
    backgroundColor: 'rgba(102,126,234,0.08)',
  },
  quickBtnText: {
    fontSize: 13,
    color: '#667eea',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
