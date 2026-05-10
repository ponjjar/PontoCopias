import { TuyaContext } from '@tuya/tuya-connector-nodejs';
import * as dotenv from 'dotenv';
dotenv.config();

const tuya = new TuyaContext({
  baseUrl: 'https://openapi.tuyaus.com',
  accessKey: process.env.TUYA_ACCESS_KEY,
  secretKey: process.env.TUYA_SECRET_KEY,
});

async function run() {
  try {
    const device_id = 'vdevo177836566289069';
    const response = await tuya.request({
      path: `/v1.0/devices/${device_id}/status`,
      method: 'GET',
    });
    console.log("Success:", response);
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error);
  }
}
run();
