import { TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { Button } from '../Button';
import { PlainBold } from '@solar-icons/react-native';

type AssistantInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  handleQuestion: (question: string) => void;
};

export const AssistantInput = ({
  containerStyle,
  value,
  handleQuestion,
  ...props
}: AssistantInputProps) => {
  return (
    <View
      className={`mx-5 max-w-full border border-gray-300 bg-white ${value === '' ? 'flex-row items-center gap-4 rounded-full py-3 pr-3 pl-6' : 'gap-8 rounded-4xl p-6'}`}
      style={[
        {
          // iOS
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          // Android
          elevation: 12,
        },
        containerStyle,
      ]}
    >
      <TextInput
        placeholder="Pergunte algo..."
        className="font-manrope-medium grow text-lg leading-none text-slate-800 placeholder:leading-none placeholder:text-slate-400"
        value={value}
        multiline
        numberOfLines={6}
        {...props}
      />

      <Button
        type={value && value !== '' ? 'primary' : 'disabled'}
        width="hug"
        style={{ alignSelf: 'flex-end' }}
        icon={
          <PlainBold size={24} color={value !== '' ? '#FFFFFF' : '#A0AEC0'} />
        }
        onPress={() => value && value !== '' && handleQuestion(value)}
      />
    </View>
  );
};
