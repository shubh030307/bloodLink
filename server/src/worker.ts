import { httpServerHandler } from 'cloudflare:node';
import { app } from './app';

const server: any = app;
server.address = () => ({ port: 8080 });
export default httpServerHandler(server);
