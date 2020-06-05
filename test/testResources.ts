import { MiddlewareContext } from '../src/types';

export const getMockContext = (): MiddlewareContext => ({
  done: jest.fn(),
  // @ts-ignore
  log: jest.fn(),
  passDownObj: {},
});
