import { ChatRoundDotsOutline } from '@solar-icons/react-native';
import { Text, TouchableOpacity, View } from 'react-native';

type DefaultQuestionProps = {
  question: string;
  select: (question: string) => void;
};

export const DefaultQuestion = ({ question, select }: DefaultQuestionProps) => {
  return (
    <TouchableOpacity
      onPress={() => select(question)}
      className="h-full w-40 gap-2 rounded-4xl border border-gray-300 p-4"
    >
      <ChatRoundDotsOutline size={16} color="#805AD5" />
      <Text className="font-manrope-medium text-base">{question}</Text>
    </TouchableOpacity>
  );
};
