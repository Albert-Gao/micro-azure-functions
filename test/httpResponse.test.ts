import {
  badRequest,
  buildResponseObject,
  success,
  internalError,
  httpResponse,
} from '../src/httpResponse';

test('badRequest()', () => {
  const mockBody = { message: 'test' };

  const result = badRequest({ body: mockBody });

  expect(result.status).toEqual(400);
  expect(result.body).toEqual(mockBody);
  expect(result.headers).toEqual({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });
});

test('buildResponseObject should set default statusCode to 200', () => {
  const res = buildResponseObject({ body: { message: true } });
  expect(res.status).toBe(200);
});

test('badRequest should set default statusCode to 400', () => {
  const res = badRequest({ body: { message: true } });
  expect(res.status).toBe(400);
});

test('internalError should set default statusCode to 500', () => {
  const res = internalError({ body: { message: true } });
  expect(res.status).toBe(500);
});

test('httpResponse should set default statusCode to 200', () => {
  const res = httpResponse({ body: { message: true } });
  expect(res.status).toBe(200);
});

test('success should set default statusCode to 200', () => {
  const res = success({ body: { message: true } });
  expect(res.status).toBe(200);
});
