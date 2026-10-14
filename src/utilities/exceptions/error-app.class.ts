interface IErrorAppField {
  path: string;
  value?: unknown;
  comment: string;
}

interface IErrorAppDetails {
  message?: string;
  fields?: IErrorAppField[];
}

/**
 * Ошибка приложения с HTTP-статусом и кодом для клиента.
 */
class ErrorApp extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: IErrorAppField[];

  constructor(
    status: number,
    code: string,
    defaultMessage: string,
    details?: IErrorAppDetails,
    cause?: unknown,
  ) {
    super(details?.message ?? defaultMessage, { cause });

    this.name = 'ErrorApp';
    this.status = status;
    this.code = code;
    this.fields = details?.fields;
  }
}

export { ErrorApp };
export type { IErrorAppDetails, IErrorAppField };
