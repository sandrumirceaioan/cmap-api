import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperModule } from './scrapper/scrapper.module';
import { CasinosModule } from './casinos/casinos.module';
import { BonusesModule } from './bonuses/bonuses.module';
// import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/cbo', { useNewUrlParser: true }),
    CasinosModule,
    BonusesModule,
    ScrapperModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}