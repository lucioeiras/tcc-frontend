import { useState } from 'react';

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

import { useSignIn } from '../../hooks/useAuth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate } = useSignIn();

  const router = useRouter();

  const handleSignIn = () => {
    if (!email || !password) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    mutate({
      email,
      password,
    });
  };

  return (
    <SafeAreaView>
      <StatusBar style="auto" backgroundColor="#ffffff" />

      <KeyboardAwareScrollView
        style={{ height: '100%' }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}>
        <View className="h-screen items-center justify-center gap-10 bg-white px-8">
          <View className="w-full items-center gap-3">
            <Text className="font-manrope text-3xl text-slate-700">Seja bem-vindo de volta!</Text>
            <Text className="font-manrope line text-center text-4xl/relaxed text-slate-900">
              Organize seu negócio sem complicação
            </Text>
          </View>

          <View className="w-full gap-6">
            <Input
              label="E-mail"
              placeholder="exemplo@dominio.com"
              textContentType="emailAddress"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Senha"
              placeholder="Digite sua senha"
              textContentType="password"
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View className="w-full items-center gap-3">
            <Button title="Entrar" type="primary" width="fill" onPress={handleSignIn} />

            <Button
              title="Ainda não possuo uma conta"
              type="tertiary"
              width="fill"
              onPress={() => router.navigate('/auth/signup')}
            />

            <Button className="mt-4" title="Esqueci minha senha" type="naked" onPress={() => {}} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
