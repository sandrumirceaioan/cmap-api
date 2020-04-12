import { createParamDecorator } from '@nestjs/common';
import * as requestIp from 'request-ip';
import * as geoip from 'geoip-lite';

export const IpAddress = createParamDecorator((data, req) => {
  let ip;
  if (req.clientIp) {
    ip = req.clientIp;
    return req.clientIp;
  } else {
    ip = requestIp.getClientIp(req);
  }

  let geo = geoip.lookup(ip);
  if (geo) return geo;
  return 'N/A';
});