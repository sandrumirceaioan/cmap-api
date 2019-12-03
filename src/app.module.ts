import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperModule } from './scrapper/scrapper.module';
import { CasinosModule } from './casinos/casinos.module';
import { BonusesModule } from './bonuses/bonuses.module';
import { SlotsModule } from './slots/slots.module';
import { AffiliatesModule } from './affiliates/affiliates.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/cbo', { useNewUrlParser: true }),
    CasinosModule,
    BonusesModule,
    SlotsModule,
    AffiliatesModule,
    ScrapperModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}