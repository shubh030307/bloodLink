import { httpServerHandler } from 'cloudflare:node';
import { app } from './app';

// Mock a NodeStyleServer to satisfy Cloudflare's httpServerHandler
// We cannot use app.listen() or http.createServer() as unenv doesn't implement them for Workers.
const server: any = app;
server.address = () => ({ port: 8080 });

// @ts-ignore - Cloudflare's NodeStyleServer type is slightly incompatible with Express's http.Server
export default httpServerHandler(server);
