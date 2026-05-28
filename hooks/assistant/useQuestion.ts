import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

type QuestionProps = {
  message: string;
};

export const useQuestion = () => {
  const { jwt } = useAuth();

  return useMutation({
    mutationFn: async ({ message }: QuestionProps) => {
      const response = await api.post(
        '/chat/message',
        {
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return response.data.reply;
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || error);
        console.log(error);
      } else {
        alert('Erro desconhecido. Tente novamente.');
      }
    },
  });
};
