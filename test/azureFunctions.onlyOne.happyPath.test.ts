import { httpResponse, azureFunctions, success } from '../src';
import { getMockContext } from './testResources';

it('should return an json response when using success()', async () => {
  const context = getMockContext();
  const mockResponse = { message: true };

  await azureFunctions([
    context => {
      context.res = success({ status: 203, body: mockResponse });
    },
  ])(context);

  expect(context.res).toEqual({
    body: mockResponse,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    status: 203,
  });
});

it('should return an json response when using httpResponse()', async () => {
  const context = getMockContext();
  const mockResponse = { message: true };

  await azureFunctions([
    context => {
      context.res = httpResponse({ status: 201, body: mockResponse });
    },
  ])(context);

  expect(context.res).toEqual({
    body: mockResponse,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    status: 201,
  });
});

it('should return a string when returning a string', async () => {
  const context = getMockContext();
  const mockResponse = 'test-response';

  await azureFunctions([
    context => {
      context.res = { body: mockResponse };
    },
  ])(context);

  expect(context.res).toEqual({
    body: mockResponse,
  });
});

it('should return a number when returning a number', async () => {
  const context = getMockContext();
  const mockResponse = 8888;

  await azureFunctions([
    context => {
      context.res = { body: mockResponse };
    },
  ])(context);

  expect(context.res).toEqual({
    body: mockResponse,
  });
});

it('should return a boolean when returning a boolean', async () => {
  const context = getMockContext();
  const mockResponse = true;

  await azureFunctions([
    context => {
      context.res = { body: mockResponse };
    },
  ])(context);

  expect(context.res).toEqual({
    body: mockResponse,
  });
});
