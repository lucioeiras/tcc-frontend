type ValidationError = {
  msg?: unknown;
  message?: unknown;
};

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  errors?: ValidationError[];
};

const isApiErrorBody = (data: unknown): data is ApiErrorBody =>
  typeof data === 'object' && data !== null;

export const getApiErrorMessage = (
  data: unknown,
  fallback = 'Erro desconhecido. Tente novamente.'
) => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (!isApiErrorBody(data)) {
    return fallback;
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }

  const firstError = data.errors?.find((error) => {
    return (
      (typeof error.msg === 'string' && error.msg.trim()) ||
      (typeof error.message === 'string' && error.message.trim())
    );
  });

  if (typeof firstError?.msg === 'string' && firstError.msg.trim()) {
    return firstError.msg;
  }

  if (typeof firstError?.message === 'string' && firstError.message.trim()) {
    return firstError.message;
  }

  return fallback;
};
