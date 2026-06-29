#!/usr/bin/env node
// scripts/opencode.mjs
// Loads .env from the project root and spawns `opencode` with those env vars.
// Usage: npm run opencode

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');

// Parse .env and inject into process.env
try {
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key) process.env[key] = value;
  }
  console.log('✅ .env cargado correctamente');
} catch (err) {
  console.warn('⚠️  No se pudo leer .env:', err.message);
}

// Spawn opencode inheriting stdin/stdout/stderr
const proc = spawn('opencode', [], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

proc.on('exit', (code) => process.exit(code ?? 0));
