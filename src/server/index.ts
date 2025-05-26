import { t } from './trpc';
import { getValidatorsProcedure } from './routers';
import { getConfig } from './config/helper';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';

void main();

async function main() {
  await runServer();
}

async function runServer() {
  console.log('====start======');
  const config = await getConfig();
  console.log('====start create server======');
  const server = createHTTPServer({
    router: t.router({
      getValidators: getValidatorsProcedure,
    }),
    middleware: cors(),
  });
  console.log('====end create server======');
  server.listen(config.port);
  console.log('====end======');
}
