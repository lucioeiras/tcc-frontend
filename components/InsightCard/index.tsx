import { StarsBold } from '@solar-icons/react-native';
import { Text, View } from 'react-native';

type InsightCardProps = {
  text: string;
};

export const InsightCard = ({ text }: InsightCardProps) => {
  return (
    <View className="rounded-4xl border border-purple-300 bg-purple-50 p-6">
      <View className="flex-row items-center gap-2">
        <StarsBold size={16} color="#805AD5" />
        <Text className="font-manrope-semibold text-base text-purple-700">Diagnóstico</Text>
      </View>

      <Text className="font-manrope-medium mt-2 text-base text-gray-800">{text}</Text>
    </View>
  );
};
