import { fileURLToPath, URL } from 'node:url';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { defineConfig, loadEnv } from 'vite';
import plugin from '@vitejs/plugin-react';
import { env as processEnv } from 'process';

function readAspNetCert() {
  const baseFolder =
    processEnv.APPDATA !== undefined && processEnv.APPDATA !== ''
      ? `${processEnv.APPDATA}/ASP.NET/https`
      : `${processEnv.HOME}/.aspnet/https`;

  const certificateName = 'vibetest.client';
  const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
  const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
  }

  if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    const result = child_process.spawnSync(
      'dotnet',
      ['dev-certs', 'https', '--export-path', certFilePath, '--format', 'Pem', '--no-password'],
      { stdio: 'inherit' },
    );
    if (result.status !== 0) {
      throw new Error('Could not create ASP.NET dev certificate.');
    }
  }

  return {
    key: fs.readFileSync(keyFilePath),
    cert: fs.readFileSync(certFilePath),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const appMode = env.VITE_APP_MODE ?? 'guest';
  const isFullMode = appMode === 'full';
  const base = env.VITE_BASE_PATH || '/';

  const apiTarget = processEnv.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${processEnv.ASPNETCORE_HTTPS_PORT}`
    : processEnv.ASPNETCORE_URLS
      ? processEnv.ASPNETCORE_URLS.split(';')[0]
      : 'https://localhost:7215';

  return {
    base,
    plugins: [plugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: isFullMode
      ? {
          port: parseInt(processEnv.DEV_SERVER_PORT || '64028'),
          https: readAspNetCert(),
          proxy: {
            '^/api': {
              target: apiTarget,
              secure: false,
            },
          },
        }
      : {
          port: parseInt(processEnv.DEV_SERVER_PORT || '5173'),
        },
  };
});
