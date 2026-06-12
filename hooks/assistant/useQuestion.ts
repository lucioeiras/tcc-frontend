import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

type QuestionProps = {
  message: string;
  conversationId?: string | null;
};

type QuestionResponse = {
  reply: string;
  conversationId: string;
};

export const useQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, conversationId }: QuestionProps) => {
      const response = await api.post<QuestionResponse>('/chat/message', {
        message,
        ...(conversationId ? { conversationId } : {}),
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        alert(getApiErrorMessage(error.response?.data));
        console.log(error);
      } else {
        alert('Erro desconhecido. Tente novamente.');
      }
    },
  });
};
