import { setItemAsync } from 'expo-secure-store';

import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

type SignUpProps = {
  name: string;
  email: string;
  password: string;
};

const signUp = async ({ name, email, password }: SignUpProps) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
  });

  return response.data;
};

export const useSignUp = () => {
  const { setSigned } = useAuth();

  return useMutation({
    mutationFn: signUp,
    onSuccess: async (data) => {
      const { user, token } = data;

      if (token) {
        await setItemAsync('jwt', token);
        await setItemAsync('usuario', JSON.stringify(user));
      }

      setSigned(true);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
      } else {
        alert('Erro desconhecido. Tente novamente.');
      }
    },
  });
};
