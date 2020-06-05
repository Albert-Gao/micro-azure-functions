import { funcQueueExecutor } from './funcQueueExecutor';
import { Middleware, MiddlewareContext } from './types';
import { AzureFunction } from '@azure/functions';
import { buildResponseObject } from './httpResponse';

export const azureFunctions = (
  middlewares: Middleware[] = [],
  config?: {
    logError?: boolean;
    logRequest?: boolean;
  }
) => {
  const wrapperHandler: AzureFunction = async (context, ...args) => {
    if (config?.logRequest) {
      context.log('request', context.req);
    }

    try {
      await funcQueueExecutor({
        context: context as MiddlewareContext,
        args,
        middlewares,
      });
    } catch (error) {
      if (config?.logError) {
        context.log(error);
      }

      context.res = buildResponseObject({
        status: error.status || 500,
        body: error.body || error,
        headers: error.headers,
      });
    } finally {
      context.done();
    }
  };

  return wrapperHandler;
};
