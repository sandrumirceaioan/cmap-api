import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AnyExceptionsFilter } from '../src/common/filters/any-exceptions.filter';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new AnyExceptionsFilter());
  app.setGlobalPrefix('/api');
  app.enableCors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  });
  app.useStaticAssets(join(__dirname + './../assets/casinos'));
  app.useStaticAssets(join(__dirname + './../assets/slots/logo'));
  app.useStaticAssets(join(__dirname + './../assets/slots/screenshot'));
  app.useStaticAssets(join(__dirname + './../assets/flags'));
  app.useStaticAssets(join(__dirname + './../assets/providers'));
  app.useStaticAssets(join(__dirname + './../assets/payments'));
  // app.useStaticAssets(join(__dirname + './../assets/slots/logo'), { prefix: "/slots/logo" });
  // app.useStaticAssets(join(__dirname + './../assets/slots/screenshot'), { prefix: "/slots/screenshot" });
  
  await app.listen(parseInt(process.env.PORT) || 3000);
}
bootstrap();
