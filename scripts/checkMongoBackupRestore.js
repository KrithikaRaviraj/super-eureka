/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

function runToolVersionCheck(tool) {
  const result = spawnSync(tool, ['--version'], { encoding: 'utf8' });
  if (result.error) {
    if (result.error.code === 'ENOENT') {
      throw new Error(`${tool} is not installed or not in PATH`);
    }
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${tool} --version failed: ${result.stderr || result.stdout}`);
  }
  console.log(`[ok] ${tool} detected`);
}

async function run() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required for backup/restore checks');
  }

  runToolVersionCheck('mongodump');
  runToolVersionCheck('mongorestore');

  await mongoose.connect(MONGODB_URI);
  const admin = mongoose.connection.db.admin();
  await admin.ping();
  await mongoose.disconnect();

  console.log('[ok] MongoDB connection ping successful');
  console.log('[ok] Backup/restore prerequisites verified');
}

run().catch(async (error) => {
  console.error('[fail] Backup/restore check failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('[warn] Failed to close MongoDB connection:', disconnectError.message);
  }
  process.exit(1);
});
