import { Text, View } from 'react-native';

type CardProps = {
  type: 'positive' | 'negative';
  title: string;
  value: string;
  description?: string;
  Icon: React.ComponentType<{ size: number; color: string; className?: string }>;
};

export const ResumeCard = ({ type, title, value, description, Icon }: CardProps) => {
  return (
    <View className="gap-4 rounded-4xl border border-gray-300 p-6">
      <View
        className={`p-2 ${type === 'positive' ? 'bg-green-500/15' : 'bg-red-500/10'} h-10 w-10 items-center justify-center rounded-lg`}>
        <Icon size={20} color={type === 'positive' ? '#3DA267' : '#C53030'} />
      </View>

      <View className="gap-2">
        <Text className="font-manrope-medium text-base text-gray-600">{title}</Text>

        <View className="flex-row items-end gap-0.5">
          <Text className="font-manrope mb-0.5 text-sm text-gray-600">R$</Text>
          <Text
            className={`font-manrope text-2xl ${type === 'positive' ? 'text-green-700' : 'text-red-700'}`}>
            {value}
          </Text>
        </View>

        {description && <Text className="font-manrope text-sm text-gray-800">{description}</Text>}
      </View>
    </View>
  );
};
