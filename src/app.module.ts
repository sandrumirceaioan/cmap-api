import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperModule } from './scrapper/scrapper.module';
import { CasinosModule } from './casinos/casinos.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/cbo', { useNewUrlParser: true }),
    CasinosModule,
    ScrapperModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}