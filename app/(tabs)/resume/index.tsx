import { useEffect } from 'react';

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { deleteItemAsync, getItem } from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

import FontAwesome from '@expo/vector-icons/FontAwesome6';

import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function Resume() {
  const router = useRouter();
  const { setSigned } = useAuth();

  const jwt = getItem('jwt');
  const user = getItem('usuario');

  useEffect(() => {
    if (!jwt) {
      router.replace('/');
    }
  }, [jwt]);

  const handleSignOut = async () => {
    await deleteItemAsync('jwt');
    await deleteItemAsync('usuario');

    setSigned(false);
    router.replace('/');
  };

  return (
    <SafeAreaView>
      <StatusBar style="auto" backgroundColor="#ffffff" />

      <View className="items-center justify-center p-10">
        <Text className="mb-8">{user}</Text>

        <Button
          type="tertiary"
          icon={<FontAwesome name="arrow-right-from-bracket" size={16} color="#475569" />}
          iconOrientation="horizontal"
          width="hug"
          onPress={handleSignOut}
        />
      </View>
    </SafeAreaView>
  );
}
