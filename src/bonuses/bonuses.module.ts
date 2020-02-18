import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BonusesController } from './bonuses.controller';
import { BonusesService } from './bonuses.service';
import { BonusesSchema } from './bonuses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Bonus', schema: BonusesSchema}])
  ],
  controllers: [BonusesController],
  providers: [BonusesService],
  exports: [BonusesService]
})
export class BonusesModule {}
