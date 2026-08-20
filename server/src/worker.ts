import { httpServerHandler } from 'cloudflare:node';
import { app } from './app';

const server = app.listen(8080, () => {
  console.log('Cloudflare Edge server started on port 8080');
});

export default httpServerHandler(server);
