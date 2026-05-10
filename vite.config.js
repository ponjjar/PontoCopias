import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TuyaContext } from '@tuya/tuya-connector-nodejs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const tuya = new TuyaContext({
    baseUrl: 'https://openapi.tuyaus.com',
    accessKey: env.TUYA_ACCESS_KEY,
    secretKey: env.TUYA_SECRET_KEY,
  });

  function tuyaPlugin() {
    return {
      name: 'tuya-plugin',
      configureServer(server) {
        server.middlewares.use('/api/tuya-status', async (req, res) => {
          try {
            const device_id = 'vdevo177836566289069';
            const response = await tuya.request({
              path: `/v1.0/devices/${device_id}/status`,
              method: 'GET',
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response));
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      }
    };
  }

  return {
    plugins: [react(), tuyaPlugin()],
  };
});
