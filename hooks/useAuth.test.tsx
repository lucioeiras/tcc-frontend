import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { setItemAsync } from 'expo-secure-store';

import { useSignIn, useSignUp } from './useAuth';
import { api } from '../services/api';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn((config) => config),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('../services/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

const mockedUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedSetItemAsync = setItemAsync as jest.MockedFunction<typeof setItemAsync>;
const mockedPost = api.post as jest.Mock;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ navigate: jest.fn() } as never);
  });

  it('configura o fluxo de login com sucesso', async () => {
    const navigate = jest.fn();
    mockedUseRouter.mockReturnValue({ navigate } as never);

    const mutationConfig = useSignIn() as any;

    expect(mockedUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    mockedPost.mockResolvedValueOnce({
      data: {
        token: 'token-123',
        user: { id: 1, name: 'Ana' },
      },
    });

    await mutationConfig.mutationFn({
      email: 'ana@exemplo.com',
      password: '123456',
    });

    await mutationConfig.onSuccess({
      token: 'token-123',
      user: { id: 1, name: 'Ana' },
    });

    expect(mockedPost).toHaveBeenCalledWith('/auth/login', {
      email: 'ana@exemplo.com',
      password: '123456',
    });
    expect(mockedSetItemAsync).toHaveBeenCalledWith('jwt', 'token-123');
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'usuario',
      JSON.stringify({ id: 1, name: 'Ana' })
    );
    expect(navigate).toHaveBeenCalledWith('/resume');
  });

  it('configura o fluxo de cadastro com sucesso', async () => {
    const navigate = jest.fn();
    mockedUseRouter.mockReturnValue({ navigate } as never);

    const mutationConfig = useSignUp() as any;

    expect(mockedUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    mockedPost.mockResolvedValueOnce({
      data: {
        token: 'token-456',
        user: { id: 2, name: 'Bruno' },
      },
    });

    await mutationConfig.mutationFn({
      name: 'Bruno',
      email: 'bruno@exemplo.com',
      password: 'abcdef',
    });

    await mutationConfig.onSuccess({
      token: 'token-456',
      user: { id: 2, name: 'Bruno' },
    });

    expect(mockedPost).toHaveBeenCalledWith('/auth/register', {
      name: 'Bruno',
      email: 'bruno@exemplo.com',
      password: 'abcdef',
    });
    expect(mockedSetItemAsync).toHaveBeenCalledWith('jwt', 'token-456');
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'usuario',
      JSON.stringify({ id: 2, name: 'Bruno' })
    );
    expect(navigate).toHaveBeenCalledWith('/resume');
  });
});
