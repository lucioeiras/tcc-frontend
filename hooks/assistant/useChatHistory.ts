import { useQuery } from '@tanstack/react-query';

import { api } from '@/services/api';
import { Question } from '@/types/question';

type ConversationSummary = {
  id: string;
  startedAt: string;
  status: boolean;
  messageCount: number;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  sender: 'USER' | 'BOT';
  content: string;
  createdAt: string;
};

type ConversationDetail = {
  id: string;
  startedAt: string;
  status: boolean;
  messages: ChatMessage[];
};

// Converte a sequência de mensagens em pares pergunta/resposta usados pela UI
const toQuestionPairs = (messages: ChatMessage[]): Question[] => {
  const pairs: Question[] = [];

  for (const message of messages) {
    if (message.sender === 'USER') {
      pairs.push({ message: message.content, reply: '' });
    } else if (pairs.length > 0 && !pairs[pairs.length - 1].reply) {
      pairs[pairs.length - 1].reply = message.content;
    } else {
      pairs.push({ message: '', reply: message.content });
    }
  }

  return pairs;
};

const fetchActiveConversation = async () => {
  const { data: conversations } = await api.get<ConversationSummary[]>('/chat/history');

  const active = conversations.find((conversation) => conversation.status);

  if (!active) {
    return { conversationId: null, questions: [] as Question[] };
  }

  const { data: conversation } = await api.get<ConversationDetail>(
    `/chat/history/${active.id}`
  );

  return {
    conversationId: conversation.id,
    questions: toQuestionPairs(conversation.messages),
  };
};

export const useChatHistory = () => {
  return useQuery({
    queryKey: ['chat-history'],
    queryFn: fetchActiveConversation,
    staleTime: 1000 * 60,
  });
};
