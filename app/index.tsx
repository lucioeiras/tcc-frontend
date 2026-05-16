import { useEffect } from 'react';

import { Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { getItem } from 'expo-secure-store';

import { Button } from 'components/Button';

import './global.css';

export default function App() {
  const router = useRouter();

  const jwt = getItem('jwt');

  useEffect(() => {
    if (jwt) {
      router.navigate('/user');
    }
  }, [jwt]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" translucent backgroundColor="transparent" />

      <View className="h-1/2 w-full px-3">
        <Image
          source={require('../assets/images/onboard.png')}
          className="rounded-3xl object-cover"
        />
      </View>

      <View className="h-1/2 items-center justify-center gap-10 bg-white px-8">
        <View className="w-full items-center gap-3">
          <Text className="font-manrope text-3xl text-slate-700">Seja bem-vindo!</Text>
          <Text className="font-manrope line text-center text-4xl/relaxed text-slate-900">
            Organize seu negócio sem complicação
          </Text>
        </View>

        <View className="w-full gap-3">
          <Button
            title="Iniciar sessão"
            type="tertiary"
            width="fill"
            onPress={() => router.navigate('/auth/signin')}
          />
          <Button
            title="Ainda não possuo uma conta"
            type="primary"
            width="fill"
            onPress={() => router.navigate('/auth/signup')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
