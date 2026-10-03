const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const http = require('node:http');
const { setTimeout: pause } = require('node:timers/promises');

test(
  'production routing serves canonical gochujang and redirects its legacy case once in both domains',
  { timeout: 60000 },
  async (t) => {
    const root =
      process.env.ROUTE_TEST_BUILD_DIR || path.resolve(__dirname, '..');
    const products = require(
      path.join(root, 'lib/ingredientShoppingProducts.json')
    );
    const reservation = net.createServer();
    await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
    const port = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));
    const server = spawn(
      process.execPath,
      [
        require.resolve('next/dist/bin/next'),
        'start',
        '-p',
        String(port),
        '-H',
        '127.0.0.1',
      ],
      { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let logs = '';
    server.stdout.on('data', (chunk) => {
      logs += chunk;
    });
    server.stderr.on('data', (chunk) => {
      logs += chunk;
    });
    t.after(async () => {
      if (server.exitCode !== null) return;
      await new Promise((resolve) => {
        server.once('exit', resolve);
        server.kill('SIGTERM');
      });
    });
    const request = (host, pathname) =>
      new Promise((resolve, reject) => {
        const req = http.get(
          {
            hostname: '127.0.0.1',
            port,
            path: pathname,
            headers: { host },
            timeout: 5000,
          },
          (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              body += chunk;
            });
            res.on('end', () =>
              resolve({
                status: res.statusCode,
                location: res.headers.location,
                body,
              })
            );
          }
        );
        req.on('timeout', () => req.destroy(new Error('HTTP timeout')));
        req.on('error', reject);
      });
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      assert.equal(server.exitCode, null, logs);
      try {
        await request('www.hansikyoung.com', '/ingredients/gochugaru');
        ready = true;
        break;
      } catch {
        await pause(100);
      }
    }
    assert.ok(ready, logs);
    for (const [locale, host] of [
      ['en', 'www.hansikyoung.com'],
      ['de', 'www.leckere-koreanische-rezepte.de'],
    ]) {
      const canonical = await request(host, '/ingredients/gochujang');
      assert.equal(
        canonical.status,
        200,
        `${locale} canonical URL must load without redirecting`
      );
      assert.ok(
        canonical.body.includes(products.gochujang[locale][0].url),
        `${locale} exact product link`
      );
      const legacy = await request(host, '/ingredients/Gochujang');
      assert.equal(legacy.status, 308, `${locale} legacy redirect`);
      assert.equal(
        new URL(legacy.location, `https://${host}`).pathname,
        '/ingredients/gochujang'
      );
      const destination = await request(
        host,
        new URL(legacy.location, `https://${host}`).pathname
      );
      assert.equal(
        destination.status,
        200,
        `${locale} legacy destination must load in one hop`
      );
    }
  }
);
