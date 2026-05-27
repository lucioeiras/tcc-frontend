import { RelativePathString, usePathname, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

const colors = {
  active: '#AD47FF',
  inactive: '#6B7280',
};

type TabProps = {
  name: string;
  path: RelativePathString;
  ActiveIcon: React.ComponentType<{ size: number; color: string; className?: string }>;
  InactiveIcon: React.ComponentType<{ size: number; color: string; className?: string }>;
};

export const Tab = ({ name, path, ActiveIcon, InactiveIcon }: TabProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <TouchableOpacity
      className="z-10 flex-1 flex-row items-center justify-center gap-2 p-3"
      activeOpacity={0.8}
      onPress={() => `.${pathname}` !== path && router.push(path)}>
      {`.${pathname}` === path ? (
        <ActiveIcon size={20} color={colors.active} className="mr-2" />
      ) : (
        <InactiveIcon size={20} color={colors.inactive} className="mr-2" />
      )}
      <Text
        className={`text-base ${`.${pathname}` === path ? 'font-manrope-bold text-slate-800' : 'font-manrope text-gray-500'}`}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};
