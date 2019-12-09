import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperController } from './scrapper.controller';
import { CasinosModule } from '../casinos/casinos.module';
import { CasinosAskgamblersService } from './casinos-askgamblers.service';
import { BonusesAskgamblersService } from './bonuses-askgamblers.service';
import { SlotsAskgamblersService } from './slots-askgamblers.service';
import { BonusesModule } from '../bonuses/bonuses.module';
import { SlotsModule } from '../slots/slots.module';
import { ProvidersModule } from '../providers/providers.module';
import { PaymentMethodsModule } from '../payments/payment-methods.module';

@Module({
  imports: [CasinosModule, BonusesModule, SlotsModule, ProvidersModule, PaymentMethodsModule],
  controllers: [ScrapperController],
  providers: [
    CasinosAskgamblersService, 
    BonusesAskgamblersService,
    SlotsAskgamblersService
  ],
  exports: []
})
export class ScrapperModule {}
