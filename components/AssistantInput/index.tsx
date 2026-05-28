import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Button } from '../Button';
import { PlainBold } from '@solar-icons/react-native';

export const AssistantInput = ({ value, ...props }: TextInputProps) => {
  console.log(value);

  return (
    <View
      className="max-w-full gap-8 rounded-4xl border border-gray-300 bg-white p-6 mx-5"
      style={{
        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        // Android
        elevation: 12,
      }}
    >
      <TextInput
        placeholder="Pergunte algo..."
        className="font-manrope-medium w-full text-lg leading-none text-slate-800 placeholder:leading-none placeholder:text-slate-400"
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
      />
    </View>
  );
};
