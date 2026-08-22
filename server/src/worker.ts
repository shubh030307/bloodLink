import { app } from './app';

export default {
  fetch(request: Request, env: any, ctx: ExecutionContext) {
    // Inject env bindings globally or on the request context
    process.env = { ...process.env, ...env };

    // Hono seamlessly handles the Cloudflare Worker fetch event
    return app.fetch(request, env, ctx);
  }
};
app.get('/', (c) => {
  return c.json({
    status: 'OK',
    service: 'BloodLink API',
    message: 'Backend is running on Cloudflare Workers'
  });
});