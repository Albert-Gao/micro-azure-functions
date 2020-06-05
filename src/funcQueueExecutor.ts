import { Middleware, MiddlewareContext } from './types';

export const funcQueueExecutor = async ({
  context,
  args,
  middlewares,
}: {
  context: MiddlewareContext;
  args: any[];
  middlewares: Middleware[];
}) => {
  for (let i = 0; i <= middlewares.length - 1; i += 1) {
    await middlewares[i](context, ...args);
  }
};
