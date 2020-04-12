import { createParamDecorator } from '@nestjs/common';
import * as requestIp from 'request-ip';
import * as geoip from 'geoip-lite';

export const IpAddress = createParamDecorator(async (data, req) => {
  var ip = req.headers["x-real-ip"] || req.connection.remoteAddress;
  console.log('ip: ', ip);
  console.log(Object.keys(req.headers));
  let geo = await geoip.lookup(ip);
  if (geo) return geo;
  return 'N/A';
});