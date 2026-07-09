import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME_SUGGESTIONS = [
  'ai_suggestion_1',
  'ai_suggestion_2',
  'ai_suggestion_3',
];

export default function AIChatScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    // Placeholder response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: t('ai_placeholder_response'),
        },
      ]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 800);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendSuggestion = (key: string) => {
    setInput(t(key));
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={20} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>{t('ai_chat_title')}</Text>
          <Text style={styles.headerSub}>{t('ai_chat_sub')}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Sparkles size={32} color={colors.teal700} />
              </View>
              <Text style={styles.emptyTitle}>{t('ai_empty_title')}</Text>
              <Text style={styles.emptySub}>{t('ai_empty_sub')}</Text>
              <View style={styles.suggestions}>
                {WELCOME_SUGGESTIONS.map(key => (
                  <TouchableOpacity
                    key={key}
                    style={styles.suggestionChip}
                    onPress={() => sendSuggestion(key)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.suggestionText}>{t(key)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('ai_input_placeholder')}
            placeholderTextColor={colors.ink300}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.ink100,
  },
  headerIcon: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: colors.teal700,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.ink900, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: colors.ink400, fontWeight: '500', marginTop: 1 },
  messages: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: colors.teal50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink900, letterSpacing: -0.3 },
  emptySub: { fontSize: 13, color: colors.ink500, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  suggestions: { gap: 8, marginTop: 12, width: '100%' },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.ink100,
  },
  suggestionText: { fontSize: 13, fontWeight: '500', color: colors.ink700 },
  bubble: {
    maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.teal700,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.ink100,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAssistant: { color: colors.ink900 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.ink100,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: colors.ink900,
    borderWidth: 1, borderColor: colors.ink100,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.teal700,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.ink200 },
});
