import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperController } from './scrapper.controller';
import { CasinosModule } from '../casinos/casinos.module';
import { ScrapperCasinoGuruService } from './scrapper-casinoguru.service';
import { ScrapperAskGamblersService } from './scrapper-askgamblers.service';
import { BonusesModule } from '../bonuses/bonuses.module';

@Module({
  imports: [CasinosModule, BonusesModule],
  controllers: [ScrapperController],
  providers: [ScrapperAskGamblersService, ScrapperCasinoGuruService],
  exports: [ScrapperAskGamblersService, ScrapperCasinoGuruService]
})
export class ScrapperModule {}

