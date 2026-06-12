import { useCallback } from 'react';

import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';

import {
  ArrowDownOutline,
  ArrowUpOutline,
  CashOutBold,
  DollarMinimalisticBold,
  StarBold,
  WalletBold,
} from '@solar-icons/react-native';

import { ResumeCard } from '@/components/ResumeCard';

import { InsightCard } from '@/components/InsightCard';
import { BigNumber } from '@/components/BigNumber';
import { Header } from '@/components/Header';
import { formatBRL, useResumeData } from '@/hooks/resume/useResumeData';

export default function Resume() {
  const {
    isLoading,
    hasData,
    totalBalance,
    monthBalance,
    percentage,
    income,
    expense,
    topIncome,
    topExpense,
    refetch,
  } = useResumeData();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <SafeAreaView>
        <StatusBar style="auto" backgroundColor="#ffffff" />
        <View className="h-full items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#805AD5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <StatusBar style="auto" backgroundColor="#ffffff" />

      <View className="items-center justify-center bg-white">
        <Header />

        <ScrollView className="h-full w-full px-5 py-6">
          <BigNumber
            title="Saldo do mês"
            value={formatBRL(monthBalance)}
            percentage={Math.abs(percentage)}
            description={
              percentage >= 0
                ? 'a mais que o mês anterior'
                : 'a menos que o mês anterior'
            }
            type={percentage >= 0 ? 'positive' : 'negative'}
          />

          {!hasData && (
            <Text className="mt-4 text-center font-manrope-medium text-base text-gray-500">
              Você ainda não tem movimentações. Converse com o assistente para
              registrar suas contas e transações.
            </Text>
          )}

          {hasData && (
            <>
              <InsightCard
                text={`Seu saldo total em contas é R$ ${formatBRL(totalBalance)}. Pergunte ao assistente como melhorar seu resultado este mês.`}
              />

              <View className="mt-4 mb-44 w-full flex-row gap-2">
                <View className="flex-1 gap-2">
                  <ResumeCard
                    type="positive"
                    title="Entradas"
                    value={formatBRL(income)}
                    Icon={ArrowUpOutline}
                  />
                  {topIncome && (
                    <ResumeCard
                      type="positive"
                      title="Maior receita"
                      value={formatBRL(topIncome.total)}
                      description={`${topIncome.name} (x${topIncome.count})`}
                      Icon={StarBold}
                    />
                  )}
                  <ResumeCard
                    type="positive"
                    title="Saldo em contas"
                    value={formatBRL(totalBalance)}
                    Icon={WalletBold}
                  />
                </View>

                <View className="flex-1 gap-2">
                  <ResumeCard
                    type="negative"
                    title="Saídas"
                    value={formatBRL(expense)}
                    Icon={ArrowDownOutline}
                  />
                  {topExpense && (
                    <ResumeCard
                      type="negative"
                      title="Maior despesa"
                      value={formatBRL(topExpense.total)}
                      description={`${topExpense.name} (x${topExpense.count})`}
                      Icon={CashOutBold}
                    />
                  )}
                  <ResumeCard
                    type={monthBalance >= 0 ? 'positive' : 'negative'}
                    title="Resultado do mês"
                    value={formatBRL(monthBalance)}
                    Icon={DollarMinimalisticBold}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
