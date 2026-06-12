import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/services/api';
import { Account, Transaction } from '@/types/finance';

type CategorySummary = {
  name: string;
  total: number;
  count: number;
};

const fetchAccounts = async () => {
  const { data } = await api.get<Account[]>('/accounts');
  return data;
};

const fetchTransactions = async () => {
  const { data } = await api.get<Transaction[]>('/transactions');
  return data;
};

const isInMonth = (dateStr: string, reference: Date) => {
  const date = new Date(dateStr);
  return (
    date.getMonth() === reference.getMonth() &&
    date.getFullYear() === reference.getFullYear()
  );
};

const sumByType = (transactions: Transaction[], type: Transaction['type']) =>
  transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

// Agrupa por categoria (ou descrição) e retorna a de maior total
const topGroup = (transactions: Transaction[]): CategorySummary | null => {
  const groups = new Map<string, CategorySummary>();

  for (const transaction of transactions) {
    const name = transaction.category?.name || transaction.description || 'Sem categoria';
    const group = groups.get(name) || { name, total: 0, count: 0 };

    group.total += transaction.amount;
    group.count += 1;
    groups.set(name, group);
  }

  let best: CategorySummary | null = null;

  for (const group of groups.values()) {
    if (!best || group.total > best.total) best = group;
  }

  return best;
};

export const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const useResumeData = () => {
  const accountsQuery = useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts });
  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const accounts = accountsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthTransactions = transactions.filter((transaction) =>
    isInMonth(transaction.transactionDate, now)
  );
  const previousMonthTransactions = transactions.filter((transaction) =>
    isInMonth(transaction.transactionDate, previousMonth)
  );

  const income = sumByType(currentMonthTransactions, 'INCOME');
  const expense = sumByType(currentMonthTransactions, 'EXPENSE');
  const monthBalance = income - expense;

  const previousIncome = sumByType(previousMonthTransactions, 'INCOME');
  const previousExpense = sumByType(previousMonthTransactions, 'EXPENSE');
  const previousBalance = previousIncome - previousExpense;

  const percentage =
    previousBalance !== 0
      ? Math.round(((monthBalance - previousBalance) / Math.abs(previousBalance)) * 100)
      : 0;

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const topIncome = topGroup(
    currentMonthTransactions.filter((transaction) => transaction.type === 'INCOME')
  );
  const topExpense = topGroup(
    currentMonthTransactions.filter((transaction) => transaction.type === 'EXPENSE')
  );

  const refetch = useCallback(() => {
    accountsQuery.refetch();
    transactionsQuery.refetch();
  }, [accountsQuery, transactionsQuery]);

  return {
    isLoading: accountsQuery.isLoading || transactionsQuery.isLoading,
    isError: accountsQuery.isError || transactionsQuery.isError,
    hasData: accounts.length > 0 || transactions.length > 0,
    totalBalance,
    monthBalance,
    percentage,
    income,
    expense,
    topIncome,
    topExpense,
    refetch,
  };
};
