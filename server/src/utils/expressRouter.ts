import { Hono } from 'hono';
import { adapt } from './expressAdaptor';

export const Router = () => {
  const hono = new Hono();

  // Wrap all arguments after the first (path) in the adapt() function
  const wrap = (handlers: any[]) => handlers.map(h => {
    // If it's already a Hono instance (e.g. nested router), don't wrap it
    if (h && typeof h.fetch === 'function') return h;
    return adapt(h);
  });

  const customRouter = {
    get: (path: string, ...handlers: any[]) => (hono.get as any)(path, ...wrap(handlers)),
    post: (path: string, ...handlers: any[]) => (hono.post as any)(path, ...wrap(handlers)),
    put: (path: string, ...handlers: any[]) => (hono.put as any)(path, ...wrap(handlers)),
    delete: (path: string, ...handlers: any[]) => (hono.delete as any)(path, ...wrap(handlers)),
    patch: (path: string, ...handlers: any[]) => (hono.patch as any)(path, ...wrap(handlers)),
    use: (pathOrHandler: any, ...handlers: any[]) => {
      if (typeof pathOrHandler === 'string') {
        const wrappedHandlers = handlers.map(h => {
          if (h && h.honoApp) {
             (hono.route as any)(pathOrHandler, h.honoApp);
             return null;
          }
          return adapt(h);
        }).filter(Boolean);
        if (wrappedHandlers.length > 0) {
          (hono.use as any)(pathOrHandler, ...wrappedHandlers);
        }
      } else {
        (hono.use as any)('*', adapt(pathOrHandler), ...wrap(handlers));
      }
      return customRouter;
    },
    honoApp: hono
  };

  return customRouter;
};
