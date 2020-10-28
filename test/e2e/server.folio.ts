import { folio as baseFolio } from '@playwright/test';
import * as http from 'http';
import handler from 'serve-handler';
export { expect } from '@playwright/test';

type ServerWorkerFixtures = {
  port: number;
  server: http.Server;
};

const fixtures = baseFolio.extend<{}, ServerWorkerFixtures>();

fixtures.port.init(
  async ({ testWorkerIndex }, run) => {
    await run(3000 + testWorkerIndex);
  },
  { scope: 'worker' }
);

fixtures.server.init(
  async ({ port }, run) => {
    const app = http.createServer((request, response) => {
      return handler(request, response, {
        public: './dist',
      });
    });
    let server;
    await new Promise((f) => {
      server = app.listen(port, f);
    });
    await run(server);
    await new Promise((f) => server.close(f));
  },
  { scope: 'worker', auto: true }
);

const folio = fixtures.build();
export const it = folio.it;
export const describe = folio.describe;
