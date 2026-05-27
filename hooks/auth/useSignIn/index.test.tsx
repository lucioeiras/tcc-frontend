import { useMutation } from '@tanstack/react-query';
import { setItemAsync } from 'expo-secure-store';

import { useSignIn } from '.';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn((config) => config),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockedSetItemAsync = setItemAsync as jest.MockedFunction<typeof setItemAsync>;
const mockedPost = api.post as jest.Mock;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useSignIn', () => {
  const setSigned = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ signed: false, setSigned, signOut: jest.fn() });
  });

  it('configura o fluxo de login com sucesso', async () => {
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
    expect(setSigned).toHaveBeenCalledWith(true);
  });

  it('não salva token quando não há token na resposta', async () => {
    const mutationConfig = useSignIn() as any;

    await mutationConfig.onSuccess({ user: { id: 1, name: 'Ana' } });

    expect(mockedSetItemAsync).not.toHaveBeenCalled();
    expect(setSigned).toHaveBeenCalledWith(true);
  });
});
