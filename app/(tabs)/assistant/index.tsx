import { useState, useRef, useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';

import { AssistantEmptyState } from '@/components/AssistantEmptyState';
import { AssistantInput } from '@/components/AssistantInput';
import { Header } from '@/components/Header';
import { Question } from '@/types/question';
import { useQuestion } from '@/hooks/assistant/useQuestion';
import { useChatHistory } from '@/hooks/assistant/useChatHistory';

const markdownStyles = StyleSheet.create({
  body: {
    color: '#111827',
    fontFamily: 'Manrope-Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  heading3: {
    color: '#111827',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 8,
    marginBottom: 8,
  },
  strong: {
    fontFamily: 'Manrope-SemiBold',
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
});

export default function Assistant() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showMessage, setShowMessage] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const { mutate } = useQuestion();
  const { data: history } = useChatHistory();

  const insets = useSafeAreaInsets();

  // Carrega a conversa ativa (mensagens anteriores) ao abrir a tela
  useEffect(() => {
    if (history && questions.length === 0 && history.questions.length > 0) {
      setQuestions(history.questions);
      setConversationId(history.conversationId);
    }
  }, [history, questions.length]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleQuestion = (question: string) => {
    mutate(
      { message: question, conversationId },
      {
        onSuccess: (response) => {
          setConversationId(response.conversationId);

          setQuestions((prev) => [
            ...prev,
            {
              message: question,
              reply: response.reply,
            },
          ]);

          setQuery('');
        },
      },
    );
  };

  const inputBottomOffset = keyboardHeight > 0 ? keyboardHeight + 12 : 144;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <StatusBar style="auto" backgroundColor="#ffffff" />

      <View className="flex-1 bg-white">
        <Header />

        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: inputBottomOffset + 96,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {questions.length === 0 && (
            <AssistantEmptyState
              setQuery={setQuery}
              showMessage={showMessage}
            />
          )}

          {questions.length > 0 && (
            <View style={{ paddingBottom: 24, gap: 32 }}>
              {questions.map((question, index) => (
                <View key={index} className="gap-4 px-5">
                  {!!question.message && (
                    <View className="bg-gray-100 p-4 rounded-2xl self-end max-w-[80%]">
                      <Text className="text-base font-manrope-semibold text-gray-800">
                        {question.message}
                      </Text>
                    </View>
                  )}
                  {!!question.reply && (
                    <Markdown style={markdownStyles}>{question.reply}</Markdown>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <AssistantInput
          value={query}
          onChangeText={setQuery}
          onPress={() => setShowMessage(false)}
          onEndEditing={() => setShowMessage(true)}
          containerStyle={{
            position: 'absolute',
            right: 0,
            bottom: inputBottomOffset,
            left: 0,
          }}
          handleQuestion={handleQuestion}
        />
      </View>
    </View>
  );
}
