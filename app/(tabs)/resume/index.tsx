import { useEffect } from 'react';

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { deleteItemAsync, getItem } from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

import FontAwesome from '@expo/vector-icons/FontAwesome6';

import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ResumeCard } from '@/components/ResumeCard';
import {
  AltArrowUpBold,
  ArrowDownOutline,
  ArrowUpOutline,
  CashOutBold,
  CourseDownOutline,
  DollarMinimalisticBold,
  StarBold,
} from '@solar-icons/react-native';
import { InsightCard } from '@/components/InsightCard';
import { BigNumber } from '@/components/BigNumber';

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

      <View className="items-center justify-center gap-4 bg-white p-4">
        <Button
          type="tertiary"
          icon={<FontAwesome name="arrow-right-from-bracket" size={16} color="#475569" />}
          iconOrientation="horizontal"
          width="hug"
          onPress={handleSignOut}
        />

        <BigNumber
          title="Saldo do mês"
          value="123.456,78"
          percentage={5}
          description="a mais que o mês anterior"
          type="positive"
        />

        <InsightCard text="Sua margem de lucro subiu 5% este mês porque você gastou menos com fornecedores." />

        <View className="w-full flex-row gap-2">
          <View className="flex-1 gap-2">
            <ResumeCard type="positive" title="Entradas" value="32.978,45" Icon={ArrowUpOutline} />
            <ResumeCard
              type="positive"
              title="Melhor produto"
              value="7.342,89"
              description="Bolo no Pote (x48)"
              Icon={StarBold}
            />
            <ResumeCard
              type="positive"
              title="Maior lucro"
              value="5.678,12"
              description="Encomendas"
              Icon={DollarMinimalisticBold}
            />
          </View>

          <View className="flex-1 gap-2">
            <ResumeCard
              type="negative"
              title="Entradas"
              value="32.978,45"
              Icon={ArrowDownOutline}
            />
            <ResumeCard
              type="negative"
              title="Melhor produto"
              value="7.342,89"
              description="Bolo no Pote (x48)"
              Icon={CourseDownOutline}
            />
            <ResumeCard
              type="negative"
              title="Maior lucro"
              value="5.678,12"
              description="Encomendas"
              Icon={CashOutBold}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
