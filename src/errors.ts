export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export const requireExists = <T>(
  value: T | undefined,
  message = 'Not found'
): T => {
  if (!value) throw new NotFoundError(message);
  return value;
};
