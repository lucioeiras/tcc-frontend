import { setItemAsync } from 'expo-secure-store';

import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

type SignInProps = {
  email: string;
  password: string;
};

const signIn = async ({ email, password }: SignInProps) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const useSignIn = () => {
  const { setSigned } = useAuth();

  return useMutation({
    mutationFn: signIn,
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
        alert(error.response?.data?.message || error);
        console.log(error);
      } else {
        alert('Erro desconhecido. Tente novamente.');
      }
    },
  });
};
