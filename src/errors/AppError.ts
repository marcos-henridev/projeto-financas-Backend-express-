export class AppError extends Error {
  public statusCode: number;

  constructor(menssage: string, statusCode = 400) {
    super(menssage);
    this.statusCode = statusCode;
  }
}
