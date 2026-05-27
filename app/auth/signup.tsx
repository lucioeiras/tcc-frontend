import React, { useState } from 'react';

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useSignUp } from '../../hooks/useAuth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signUp = useSignUp();

  const router = useRouter();

  const handleSignUp = () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    signUp.mutate({
      name,
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
        <View className="h-full items-center justify-center bg-white px-8 pt-6">
          <View className="w-full items-center gap-3">
            <Text className="font-manrope text-3xl text-slate-700">Seja bem-vindo!</Text>
            <Text className="font-manrope line text-center text-4xl/relaxed text-slate-900">
              Organize seu negócio sem complicação
            </Text>
          </View>

          <View className="mt-4 w-full gap-6">
            <Input
              label="Nome"
              placeholder="Digite seu nome"
              textContentType="name"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="E-mail"
              placeholder="Digite seu melhor e-mail"
              textContentType="emailAddress"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Senha"
              placeholder="Digite sua senha mais segura"
              textContentType="password"
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Input
              label="Confirme a senha"
              placeholder="Digite sua senha novamente"
              textContentType="password"
              autoCapitalize="none"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View className="mt-8 w-full items-center gap-3">
            <Button title="Criar conta" type="primary" width="fill" onPress={handleSignUp} />

            <Button
              title="Já possuo uma conta"
              type="tertiary"
              width="fill"
              onPress={() => router.navigate('/auth/signin')}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
