import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import SignIn from './signin';
import { useSignIn } from '@/hooks/auth/useSignIn';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Redirect: () => null,
}));

jest.mock('@/hooks/auth/useSignIn', () => ({
  useSignIn: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSignIn = useSignIn as jest.MockedFunction<typeof useSignIn>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SignIn screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ navigate: jest.fn(), replace: jest.fn() } as never);
    mockedUseAuth.mockReturnValue({ signed: false, setSigned: jest.fn(), signOut: jest.fn() });
  });

  it('bloqueia envio sem preencher os campos', () => {
    const mutate = jest.fn();
    mockedUseSignIn.mockReturnValue({ mutate } as never);

    const { getByRole } = render(<SignIn />);

    fireEvent.press(getByRole('button', { name: 'Entrar' }));

    expect(global.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos!');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envia as credenciais ao preencher os campos', () => {
    const mutate = jest.fn();
    mockedUseSignIn.mockReturnValue({ mutate } as never);

    const { getByPlaceholderText, getByRole } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText('exemplo@dominio.com'), 'user@exemplo.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), '123456');
    fireEvent.press(getByRole('button', { name: 'Entrar' }));

    expect(mutate).toHaveBeenCalledWith({
      email: 'user@exemplo.com',
      password: '123456',
    });
  });
});
