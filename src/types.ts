import { Context } from '@azure/functions';

export interface PlainObject {
  [key: string]: string | number | boolean | object;
}

export interface HttpResponse {
  status: number;
  body: Context['res'];
  headers: { [key: string]: string };
}

export interface MiddlewareContext<PassDownObjType = any> extends Context {
  passDownObj: PassDownObjType;
}

export type Middleware<PassDownObjType = any> = (
  context: MiddlewareContext<PassDownObjType>,
  ...args: any[]
) => Promise<void> | void;
