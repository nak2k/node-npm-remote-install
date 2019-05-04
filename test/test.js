const test = require('tape');
const { exec } = require('child_process');

const command = __dirname + '/../bin/cli';
const pkgDir = __dirname + '/..';

const { TEST_SERVER } = process.env;

if (!TEST_SERVER) {
  console.error('$TEST_SERVER must be set');
  process.exit(1);
}

test('test', t => {
  t.plan(1);

  exec(`${command} ${pkgDir} ${TEST_SERVER}`, (err, stdout, stderr) => {
    t.error(err);
    console.log(stdout);
  });
});
