import { TuyaContext } from '@tuya/tuya-connector-nodejs';

const tuya = new TuyaContext({
  baseUrl: 'https://openapi.tuyaus.com',
  accessKey: process.env.TUYA_ACCESS_KEY,
  secretKey: process.env.TUYA_SECRET_KEY,
});

export default async function handler(req, res) {
  try {
    const device_id = 'vdevo177836566289069';
    const response = await tuya.request({
      path: `/v1.0/devices/${device_id}/status`,
      method: 'GET',
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
