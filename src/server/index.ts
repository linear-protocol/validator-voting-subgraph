import { t } from './trpc';
import { getValidatorsProcedure } from './routers';
import { getConfig } from './config/helper';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';

void main();

async function main() {
  await runServer();
}

function getApp() {
  return t.router({
    getValidators: getValidatorsProcedure,
  });
}

async function runServer() {
  const config = await getConfig();
  const server = createHTTPServer({
    router: getApp(),
    middleware: cors(),
  });
  server.listen(config.port);
}
