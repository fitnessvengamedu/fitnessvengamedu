const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Overwrite existing variables using stdin input to avoid Windows shell escaping issues
function runVercelEnvAdd(key, value, environment) {
  console.log(`Adding ${key} to ${environment}...`);
  try {
    const result = spawnSync('npx', ['vercel', 'env', 'add', key, environment, '--force'], {
      input: value,
      encoding: 'utf-8',
      shell: true
    });
    if (result.status !== 0) {
      throw new Error(result.stderr?.trim() || `Exit code ${result.status}`);
    }
    console.log(`Successfully added ${key} to ${environment}`);
  } catch (err) {
    console.error(`Failed to add ${key} to ${environment}:`, err.message);
  }
}

async function main() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found!');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const vars = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) continue;

    const key = trimmed.slice(0, firstEq).trim();
    let value = trimmed.slice(firstEq + 1).trim();

    // Strip surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) {
      vars.push({ key, value });
    }
  }

  console.log(`Found ${vars.length} environment variables to upload.`);

  // Upload sequentially to avoid overloading CLI/API rate limits
  const environments = ['production', 'development'];
  for (const { key, value } of vars) {
    for (const env of environments) {
      runVercelEnvAdd(key, value, env);
    }
  }

  console.log('Finished uploading all environment variables.');
}

main();
