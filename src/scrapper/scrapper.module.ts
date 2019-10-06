import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';

@Module({
  imports: [],
  controllers: [ScrapperController],
  providers: [ScrapperService],
  exports: [ScrapperService]
})
export class ScrapperModule {}

