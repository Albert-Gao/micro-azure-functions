import { success, azureFunctions, Middleware } from '../src';
import { getMockContext } from './testResources';

it('should return an json response from handler', async () => {
  const context = getMockContext();
  const mockResponse = { message: true };

  await azureFunctions([
    context => {
      context.res = {
        body: mockResponse,
      };
    },
  ])(context);

  expect(context.res).toEqual({
    body: mockResponse,
  });
});

it('should early exit when one of the middlewares throws', async () => {
  const mockMiddleware = jest.fn();
  const context = getMockContext();
  const mockError = { name: 'test' };

  await azureFunctions([
    () => {
      throw mockError;
    },
    mockMiddleware,
  ])(context);

  expect(mockMiddleware).not.toBeCalled();
  expect(context.res).toEqual({
    body: mockError,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    status: 500,
  });
});

it('should return an response when throwing', async () => {
  const mockMiddleware = jest.fn();
  const context = getMockContext();
  const mockResult = { name: 'test' };

  await azureFunctions([
    () => {
      throw success({ body: mockResult });
    },
    mockMiddleware,
  ])(context);

  expect(mockMiddleware).not.toBeCalled();
  expect(context.res).toEqual({
    body: mockResult,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    status: 200,
  });
});

it('should pass the response among the middlewares', async () => {
  const context = getMockContext();
  const mockResponse = { status: 200, body: { name: 'test' } };
  const beforeHookMock: jest.Mock<Middleware> = jest.fn();
  const mockMiddleware: jest.Mock<Middleware> = jest.fn();
  const afterHookMock: jest.Mock<Middleware> = jest.fn();

  await azureFunctions([
    context => {
      context.res = mockResponse;
    },
    (beforeHookMock as unknown) as Middleware,
    (mockMiddleware as unknown) as Middleware,
    (afterHookMock as unknown) as Middleware,
  ])(context);

  const paramOfBeforeHookMock = beforeHookMock.mock.calls[0][0];
  const paramOfmockMiddleware = mockMiddleware.mock.calls[0][0];
  const paramOfAfterHookMock = afterHookMock.mock.calls[0][0];

  expect(paramOfBeforeHookMock.res).toEqual(mockResponse);
  expect(paramOfmockMiddleware.res).toEqual(mockResponse);
  expect(paramOfAfterHookMock.res).toEqual(mockResponse);

  expect(context.res).toEqual({
    body: mockResponse.body,
    status: mockResponse.status,
  });
});

it('should return an Error response from last middleware', async () => {
  const context = getMockContext();
  const mockMiddleware = jest.fn();
  const mockError = { name: 'test' };

  await azureFunctions([
    mockMiddleware,
    () => {
      throw mockError;
    },
  ])(context);

  expect(mockMiddleware).toBeCalledTimes(1);
  expect(context.res).toEqual({
    body: mockError,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    status: 500,
  });
});

it('should return a normal response from afterHooks', async () => {
  const context = getMockContext();

  const mockMiddleware = jest.fn();
  const mockResponse = { name: 'test' };

  await azureFunctions([
    mockMiddleware,
    () => {
      context.res = {
        status: 200,
        body: mockResponse,
      };
    },
  ])(context);

  expect(mockMiddleware).toBeCalledTimes(1);
  expect(context.res).toEqual({
    body: mockResponse,
    status: 200,
  });
});

it('should call middlewares one by one', async () => {
  const context = getMockContext();

  const orders: number[] = [];

  const middleware1 = jest.fn().mockImplementation(() => orders.push(1));
  const middleware2 = jest.fn().mockImplementation(() => orders.push(2));
  const middleware3 = jest.fn().mockImplementation(() => orders.push(3));

  const middleware4 = jest.fn().mockImplementation(() => {
    orders.push(4);
    return Promise.resolve(true);
  });

  const middleware5 = jest.fn().mockImplementation(() => orders.push(5));
  const middleware6 = jest.fn().mockImplementation(() => orders.push(6));
  const middleware7 = jest.fn().mockImplementation(() => orders.push(7));

  await azureFunctions([
    middleware1,
    middleware2,
    middleware3,
    middleware4,
    middleware5,
    middleware6,
    middleware7,
  ])(context);

  expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);

  expect(middleware1).toBeCalledTimes(1);
  expect(middleware2).toBeCalledTimes(1);
  expect(middleware3).toBeCalledTimes(1);
  expect(middleware4).toBeCalledTimes(1);
  expect(middleware5).toBeCalledTimes(1);
  expect(middleware6).toBeCalledTimes(1);
  expect(middleware7).toBeCalledTimes(1);
});

it('should call async function without problems', async () => {
  const context = getMockContext();

  const mockResponse = { message: 'wow' };

  const beforeMock = jest.fn();

  const mockMiddleware: Middleware = async function(context) {
    context.res = {
      status: 200,
      body: mockResponse,
    };

    return Promise.resolve();
  };

  await azureFunctions([mockMiddleware, beforeMock])(context);

  expect(context.res).toEqual({
    body: mockResponse,
    status: 200,
  });
});

test('passDownObj should work', async () => {
  const context = getMockContext();

  const validateResponse: Middleware<{ name: string }> = ({ passDownObj }) => {
    if (passDownObj.name === 'albert') {
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 400,
        body: { message: 'bad user, bye bye' },
      };
    }
  };

  await azureFunctions([
    context => {
      const res = { name: 'albert' };
      context.passDownObj.name = res.name;
    },
    validateResponse,
  ])(context);

  expect(context.res).toEqual({
    body: {
      message: 'bad user, bye bye',
    },
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    status: 400,
  });
});

test('throw error should be captured and could override response headers', async () => {
  const context = getMockContext();

  const validateResponse: Middleware<{ name: string }> = ({ passDownObj }) => {
    if (passDownObj.name === 'albert') {
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 400,
        headers: {
          'Access-Control-Allow-Credentials': 'false',
        },
        body: { message: 'bad user, bye bye' },
      };
    }
  };

  await azureFunctions([
    context => {
      const res = { name: 'albert' };
      context.passDownObj.name = res.name;
    },
    validateResponse,
  ])(context);

  expect(context.res).toEqual({
    body: {
      message: 'bad user, bye bye',
    },
    headers: {
      'Access-Control-Allow-Credentials': 'false',
    },
    status: 400,
  });
});

it('should throw error from the last middleware rather than return the response from the 1st middleware', async () => {
  const context = getMockContext();

  const validateResponse: Middleware = context => {
    if (context.res?.body.name === 'albert') {
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 400,
        body: { message: 'bad user, bye bye' },
      };
    }
  };

  await azureFunctions([
    context => {
      context.res = {
        status: 200,
        body: { name: 'albert' },
      };
    },
    validateResponse,
  ])(context);

  expect(context.res).toEqual({
    body: {
      message: 'bad user, bye bye',
    },
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    status: 400,
  });
});
