import { createParamDecorator } from '@nestjs/common';
import * as requestIp from 'request-ip';
import * as geoip from 'geoip-lite';

export const IpAddress = createParamDecorator(async (data, req) => {
  let ip;
  if (req.clientIp) {
    ip = req.clientIp;
    return req.clientIp;
  } else {
    ip = await requestIp.getClientIp(req);
  }
  console.log('ip', ip);
  let geo = await geoip.lookup(ip);
  if (geo) return geo;
  return 'N/A';
});