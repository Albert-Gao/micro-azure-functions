// TODO: test if we can return non object
import { azureFunctions, httpError } from '../src';
import { getMockContext } from './testResources';

it('should return error when throwing httpError', async () => {
  const context = getMockContext();
  const mockResponse = { message: true };

  await azureFunctions([
    () => {
      throw httpError({ status: 402, body: mockResponse });
    },
  ])(context);

  expect(context.res).toEqual({
    status: 402,
    body: mockResponse,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
    },
  });
});

it('should return undefined when no middlewares is passing', async () => {
  const context = getMockContext();

  await azureFunctions()(context);

  expect(context.res).toEqual(undefined);
});

it('should return undefined when middlewares is empty', async () => {
  const context = getMockContext();
  await azureFunctions([])(context);

  expect(context.res).toEqual(undefined);
});
