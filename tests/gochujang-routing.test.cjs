const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const http = require('node:http');
const { setTimeout: pause } = require('node:timers/promises');

test(
  'production routing restores known ingredient aliases in one hop without canonical loops',
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
      for (const [oldPath, newPath] of [
        ['/ingredients/Gochujang', '/ingredients/gochujang'],
        ['/ingredients/%20Tofu', '/ingredients/tofu'],
        ['/ingredients/MincedGarlic', '/ingredients/minced-garlic'],
        ['/ingredients/Typ%20550', '/ingredients/wheat-flour-type-550'],
      ]) {
        // Explicit locale prefixes in old Search Console URLs must work too.
        for (const prefix of ['', `/${locale}`]) {
          const legacy = await request(host, `${prefix}${oldPath}?from=legacy`);
          assert.equal(legacy.status, 308, `${host}${prefix}${oldPath}`);
          const target = new URL(legacy.location, `https://${host}`);
          assert.equal(target.hostname, host);
          assert.equal(target.pathname, newPath);
          assert.equal(target.search, '?from=legacy');
          const destination = await request(host, target.pathname);
          assert.equal(destination.status, 200, `${host}${newPath}`);
          assert.ok(
            !destination.location,
            'canonical destination must not redirect'
          );
          assert.ok(
            destination.body.includes(
              `rel="canonical" href="https://${host}${newPath}"`
            )
          );
        }
      }
      const unrelated = await request(
        host,
        '/ingredients/not-a-real-ingredient'
      );
      assert.equal(unrelated.status, 404);
    }
  }
);
