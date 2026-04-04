export interface OperationSuccess<T> {
  success: true;
  data: T;
}

export interface OperationFailure {
  success: false;
  error: string;
  code: number;
}

export type OperationResult<T> = OperationSuccess<T> | OperationFailure;

export function ok<T>(data: T): OperationSuccess<T> {
  return { success: true, data };
}

export function fail(error: string, code: number): OperationFailure {
  return { success: false, error, code };
}

