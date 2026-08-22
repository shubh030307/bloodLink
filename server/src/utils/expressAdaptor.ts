import { Context, Next } from 'hono';

export const adapt = (expressHandler: Function) => {
  return async (c: Context, next: Next) => {
    let body: any = {};

    const contentType = c.req.header('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        body = await c.req.json();
      } catch {
        body = {};
      }
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      try {
        body = await c.req.parseBody();
      } catch {
        body = {};
      }
    }

    const headers = Object.fromEntries(
      Object.entries(c.req.header()).map(([key, value]) => [
        key.toLowerCase(),
        value
      ])
    );

    const req: any = {
      body,
      params: c.req.param(),
      query: c.req.query(),
      user: c.get('user'),
      file: c.get('file'),
      headers,
      method: c.req.method,
      path: c.req.path,
      url: c.req.url,
      ip: c.env?.CF_CONNECTING_IP || '127.0.0.1',

      // Cloudflare Worker environment
      env: c.env,
    };

    req.get = (name: string) => {
      return req.headers[name.toLowerCase()];
    };

    req.header = (name: string) => {
      return req.headers[name.toLowerCase()];
    };

    let isSent = false;
    let finalResponse: Response | null = null;
    let statusCode = 200;

    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },

      json: (data: any) => {
        isSent = true;
        finalResponse = c.json(data, statusCode as any);
        return res;
      },

      send: (data: any) => {
        isSent = true;

        finalResponse = c.text(
          typeof data === 'string'
            ? data
            : JSON.stringify(data),
          statusCode as any
        );

        return res;
      },

      setHeader: (key: string, value: string) => {
        c.header(key, value);
        return res;
      },
    };

    let nextCalled = false;

    const nextFn = () => {
      nextCalled = true;
    };

    const result = await expressHandler(req, res, nextFn);

    if (nextCalled) {
      if (req.user) {
        c.set('user', req.user);
      }
      if (req.file) {
        c.set('file', req.file);
      }

      await next();
      return;
    }

    if (isSent && finalResponse) {
      return finalResponse;
    }

    if (result instanceof Response) {
      return result;
    }

    return;
  };
};