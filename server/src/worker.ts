import { httpServerHandler } from 'cloudflare:node';
import { app } from './app';

const server = app.listen(8080, () => {
  console.log('Cloudflare Edge server started on port 8080');
});

// @ts-ignore - Cloudflare's NodeStyleServer type is slightly incompatible with Express's http.Server
export default httpServerHandler(server);
