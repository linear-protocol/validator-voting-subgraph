import { t } from './trpc';
import { getValidators, getValidatorsProcedure } from './routers';
import { getConfig } from './config/helper';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';

void main();

async function main() {
  await runServer();
}

async function runServer() {
  const config = await getConfig();
  const server = createHTTPServer({
    router: t.router({
      getValidators: getValidatorsProcedure,
    }),
    middleware: cors(),
  });
  server.listen(config.port);

  await getValidators();
}
