import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';
import { CasinosModule } from '../casinos/casinos.module';

@Module({
  imports: [CasinosModule],
  controllers: [ScrapperController],
  providers: [ScrapperService],
  exports: [ScrapperService]
})
export class ScrapperModule {}

