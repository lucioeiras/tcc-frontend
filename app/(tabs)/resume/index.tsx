import { useEffect } from 'react';

import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { getItem } from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

import {
  ArrowDownOutline,
  ArrowUpOutline,
  CashOutBold,
  CourseDownOutline,
  DollarMinimalisticBold,
  StarBold,
} from '@solar-icons/react-native';

import { ResumeCard } from '@/components/ResumeCard';

import { InsightCard } from '@/components/InsightCard';
import { BigNumber } from '@/components/BigNumber';
import { Header } from '@/components/Header';

export default function Resume() {
  const router = useRouter();

  const jwt = getItem('jwt');

  useEffect(() => {
    if (!jwt) {
      router.replace('/');
    }
  }, [jwt]);

  return (
    <SafeAreaView>
      <StatusBar style="auto" backgroundColor="#ffffff" />

      <View className="items-center justify-center bg-white">
        <Header />

        <ScrollView className="h-full w-full px-5 py-6">
          <BigNumber
            title="Saldo do mês"
            value="123.456,78"
            percentage={5}
            description="a mais que o mês anterior"
            type="positive"
          />

          <InsightCard text="Sua margem de lucro subiu 5% este mês porque você gastou menos com fornecedores." />

          <View className="mt-4 mb-44 w-full flex-row gap-2">
            <View className="flex-1 gap-2">
              <ResumeCard
                type="positive"
                title="Entradas"
                value="32.978,45"
                Icon={ArrowUpOutline}
              />
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
