import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import SignIn from './signin';
import { useSignIn } from 'hooks/useAuth';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('hooks/useAuth', () => ({
  useSignIn: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSignIn = useSignIn as jest.MockedFunction<typeof useSignIn>;

describe('SignIn screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ navigate: jest.fn() } as never);
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
