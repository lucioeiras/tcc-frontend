import {
  AltArrowDownOutline,
  CalendarMinimalisticBold,
  Logout3Outline,
  UserBold,
} from '@solar-icons/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../Button';
import { deleteItemAsync } from 'expo-secure-store';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export const Header = () => {
  const { setSigned } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await deleteItemAsync('jwt');
    await deleteItemAsync('usuario');

    setSigned(false);
    router.replace('/');
  };

  return (
    <View className="w-full flex-row items-center justify-between px-5 py-3">
      <View className="rounded-full border border-purple-300 bg-purple-100 p-3">
        <UserBold size={16} color="#805AD5" />
      </View>

      <TouchableOpacity className="h-full flex-row items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2">
        <CalendarMinimalisticBold size={14} color="#805AD5" />
        <Text className="font-manrope-semibold text-sm text-gray-700">Este mês</Text>
        <AltArrowDownOutline size={12} color="#1C274C" />
      </TouchableOpacity>

      <Button
        type="tertiary"
        icon={<Logout3Outline size={16} color="#475569" />}
        iconOrientation="horizontal"
        width="hug"
        onPress={handleSignOut}
      />
    </View>
  );
};
