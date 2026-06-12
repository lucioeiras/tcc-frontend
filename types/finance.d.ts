export type AccountType = 'WALLET' | 'BANK' | 'CREDIT_CARD' | 'SAVINGS';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  status: boolean;
};

export type Transaction = {
  id: string;
  accountId: string;
  categoryId?: string | null;
  type: TransactionType;
  amount: number;
  description?: string | null;
  transactionDate: string;
  category?: { id: string; name: string } | null;
  account?: { id: string; name: string } | null;
};
