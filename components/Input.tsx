import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  placeholder?: string;
  label?: string;
}

export const Input = ({ placeholder, label, ...props }: InputProps) => {
  return (
    <View className="flex w-full gap-2">
      {label && <Text className="ml-8 text-lg text-slate-700">{label}</Text>}

      <TextInput
        placeholder={placeholder || 'Digite aqui...'}
        className="w-full rounded-full border border-gray-300 px-8 py-4 text-lg leading-none text-slate-800 placeholder:leading-none placeholder:text-slate-400"
        {...props}
      />
    </View>
  );
};
