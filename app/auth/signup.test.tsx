import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import SignUp from './signup';
import { useSignUp } from '@/hooks/auth/useSignUp';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Redirect: () => null,
}));

jest.mock('@/hooks/auth/useSignUp', () => ({
  useSignUp: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSignUp = useSignUp as jest.MockedFunction<typeof useSignUp>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SignUp screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ navigate: jest.fn(), replace: jest.fn() } as never);
    mockedUseAuth.mockReturnValue({ signed: false, setSigned: jest.fn(), signOut: jest.fn() });
  });

  it('bloqueia envio sem preencher os campos', () => {
    const mutate = jest.fn();
    mockedUseSignUp.mockReturnValue({ mutate } as never);

    const { getByRole } = render(<SignUp />);

    fireEvent.press(getByRole('button', { name: 'Criar conta' }));

    expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos!');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('bloqueia envio quando as senhas não coincidem', () => {
    const mutate = jest.fn();
    mockedUseSignUp.mockReturnValue({ mutate } as never);

    const { getByPlaceholderText, getByRole } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText('Digite seu nome'), 'Maria');
    fireEvent.changeText(getByPlaceholderText('Digite seu melhor e-mail'), 'maria@exemplo.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha mais segura'), '123456');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha novamente'), 'abcdef');
    fireEvent.press(getByRole('button', { name: 'Criar conta' }));

    expect(global.alert).toHaveBeenCalledWith('As senhas não coincidem!');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envia os dados ao preencher corretamente', () => {
    const mutate = jest.fn();
    mockedUseSignUp.mockReturnValue({ mutate } as never);

    const { getByPlaceholderText, getByRole } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText('Digite seu nome'), 'Maria');
    fireEvent.changeText(getByPlaceholderText('Digite seu melhor e-mail'), 'maria@exemplo.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha mais segura'), '123456');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha novamente'), '123456');
    fireEvent.press(getByRole('button', { name: 'Criar conta' }));

    expect(mutate).toHaveBeenCalledWith({
      name: 'Maria',
      email: 'maria@exemplo.com',
      password: '123456',
    });
  });
});
