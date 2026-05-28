import { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, View, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistantEmptyState } from '@/components/AssistantEmptyState';
import { AssistantInput } from '@/components/AssistantInput';
import { Header } from '@/components/Header';

export default function Assistant() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [showMessage, setShowMessage] = useState(true);

  const insets = useSafeAreaInsets();

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
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {questions.length === 0 && (
            <AssistantEmptyState
              setQuery={setQuery}
              showMessage={showMessage}
            />
          )}

          <AssistantInput
            value={query}
            onChangeText={setQuery}
            onPress={() => setShowMessage(false)}
            onEndEditing={() => setShowMessage(true)}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
