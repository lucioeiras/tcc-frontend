import { AltArrowDownBold, AltArrowUpBold } from '@solar-icons/react-native';
import { Text, View } from 'react-native';

type BigNumberProps = {
  title: string;
  value: string;
  percentage: number;
  description: string;
  type: 'positive' | 'negative';
};

export const BigNumber = ({
  title,
  value,
  percentage,
  description,
  type,
}: BigNumberProps) => {
  return (
    <View className="mb-7 w-full items-center gap-1">
      <Text className="font-manrope-medium text-center text-lg leading-7 text-gray-600">
        {title}
      </Text>

      <View className="mt-3 flex-row items-end gap-1">
        <Text className="mb-2 text-3xl text-gray-500">R$</Text>
        <Text className="font-manrope-medium text-center text-5xl text-gray-900">
          {value}
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        {type === 'positive' ? (
          <AltArrowUpBold size={18} color="#3DA267" />
        ) : (
          <AltArrowDownBold size={18} color="#C53030" />
        )}
        <Text className="font-manrope-semibold text-lg text-green-700">
          {percentage}%
        </Text>
        <Text className="font-manrope-medium text-lg text-gray-700">
          {description}
        </Text>
      </View>
    </View>
  );
};
