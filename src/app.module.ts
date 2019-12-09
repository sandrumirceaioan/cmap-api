require('dotenv').config();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperModule } from './scrapper/scrapper.module';
import { CasinosModule } from './casinos/casinos.module';
import { BonusesModule } from './bonuses/bonuses.module';
import { SlotsModule } from './slots/slots.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { PaymentMethodsModule } from './payments/payment-methods.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.CONNECTION_STRING, { useNewUrlParser: true }),
    CasinosModule,
    BonusesModule,
    SlotsModule,
    AffiliatesModule,
    ScrapperModule,
    UsersModule,
    ProvidersModule,
    PaymentMethodsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}