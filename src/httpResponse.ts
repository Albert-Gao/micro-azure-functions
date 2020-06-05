import { HttpResponse, PlainObject } from './types';

interface HttpResponseParams {
  status?: number;
  body: any;
  headers?: { [key: string]: string };
}

const commonHeaders: { [key: string]: string } = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

const getMergedHeaders = (headers?: { [key: string]: string }) =>
  headers ? headers : commonHeaders;

export function buildResponseObject({
  status,
  body,
  headers,
}: Partial<HttpResponseParams>): HttpResponse {
  const result: any = {
    status: status || 200,
    body: body,
    headers: getMergedHeaders(headers),
  };

  return result;
}

export const httpResponse = ({
  status,
  body,
  headers,
}: Partial<HttpResponseParams>): HttpResponse =>
  buildResponseObject({
    status: status || 200,
    body,
    headers,
  });

class HttpError extends Error {
  status: number;
  headers = commonHeaders;
  body: PlainObject;

  constructor({ status, headers, body }: HttpResponseParams) {
    super(JSON.stringify(body));
    Object.setPrototypeOf(this, HttpError.prototype);

    this.status = status || 400;
    this.body = body;

    if (headers) {
      this.headers = getMergedHeaders(headers);
    }
  }

  public toHttpResponse() {
    return buildResponseObject({
      status: this.status,
      body: this.body,
      headers: this.headers,
    });
  }
}

export const httpError = ({
  status,
  body,
  headers,
}: Partial<HttpResponseParams>) =>
  new HttpError({
    status,
    body,
    headers,
  });

export const success = ({
  status,
  body,
  headers,
}: Partial<HttpResponseParams>): HttpResponse =>
  buildResponseObject({
    status: status || 200,
    headers: getMergedHeaders(headers),
    body,
  });

export const badRequest = ({
  status,
  body,
  headers,
}: Partial<HttpResponseParams>) =>
  httpResponse({
    status: status || 400,
    body,
    headers,
  });

export const internalError = ({
  status,
  body,
  headers,
}: Partial<HttpResponseParams>) =>
  httpResponse({
    status: status || 500,
    body,
    headers,
  });
