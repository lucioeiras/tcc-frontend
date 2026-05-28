import { useState, useRef } from 'react';

import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistantEmptyState } from '@/components/AssistantEmptyState';
import { AssistantInput } from '@/components/AssistantInput';
import { Header } from '@/components/Header';
import { Question } from '@/types/question';
import { useQuestion } from '@/hooks/assistant/useQuestion';

export default function Assistant() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [query, setQuery] = useState('');
  const [showMessage, setShowMessage] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const { mutate } = useQuestion();

  const insets = useSafeAreaInsets();

  const handleQuestion = (question: string) => {
    mutate(
      { message: question },
      {
        onSuccess: (response) => {
          setQuestions((prev) => [
            ...prev,
            {
              message: question,
              reply: response,
            },
          ]);

          setQuery('');
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar style="auto" backgroundColor="#ffffff" />

      <View className="flex-1 bg-white">
        <Header />

        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
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
                  <View className="bg-gray-100 p-4 rounded-2xl self-end max-w-[80%]">
                    <Text className="text-base font-manrope-semibold text-gray-800">
                      {question.message}
                    </Text>
                  </View>
                  <Text className="text-base text-gray-900 font-manrope-medium">
                    {question.reply}
                  </Text>
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
          handleQuestion={handleQuestion}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
