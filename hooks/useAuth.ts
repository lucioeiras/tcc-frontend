import { useRouter } from 'expo-router';
import { setItemAsync } from 'expo-secure-store';

import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { api } from '../services/api';

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
  const router = useRouter();

  return useMutation({
    mutationFn: signIn,
    onSuccess: async (data) => {
      const { user, token } = data;

      if (token) {
        await setItemAsync('jwt', token);
        await setItemAsync('usuario', JSON.stringify(user));
      }

      router.navigate('/resume');
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
      } else {
        alert('Erro desconhecido. Tente novamente.');
      }
    },
  });
};

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
  const router = useRouter();

  return useMutation({
    mutationFn: signUp,
    onSuccess: async (data) => {
      const { user, token } = data;

      if (token) {
        await setItemAsync('jwt', token);
        await setItemAsync('usuario', JSON.stringify(user));
      }

      router.navigate('/resume');
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || error);
      } else {
        alert('Erro desconhecido. Tente novamente.');
      }
    },
  });
};
