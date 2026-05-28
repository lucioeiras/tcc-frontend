import { getItem } from 'expo-secure-store';
import { ScrollView, Text, View } from 'react-native';
import { DefaultQuestion } from '../DefaultQuestion';
import { defaultQuestions } from '@/utils/getDefaultQuestions';

type AssistantEmptyStateProps = {
  setQuery: (query: string) => void;
  showMessage: boolean;
};

export const AssistantEmptyState = ({
  setQuery,
  showMessage,
}: AssistantEmptyStateProps) => {
  const user = JSON.parse(getItem('usuario') || '{}');

  return (
    <>
      {showMessage && (
        <View className="w-full grow items-center justify-center gap-2 px-5">
          <Text className="font-manrope text-center text-3xl text-gray-600">
            Olá, {user?.name}
          </Text>
          <Text className="font-manrope-medium text-center text-4xl leading-relaxed text-gray-800">
            Como eu posso lhe ajudar hoje?
          </Text>
        </View>
      )}

      <ScrollView
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 20,
          marginBottom: 20,
          marginTop: showMessage ? 0 : 80,
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {defaultQuestions.map((question, index) => (
          <DefaultQuestion
            key={index}
            question={question}
            select={() => setQuery(question)}
          />
        ))}
      </ScrollView>
    </>
  );
};
