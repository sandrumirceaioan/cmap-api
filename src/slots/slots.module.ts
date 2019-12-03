import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { SlotsSchema } from './slots.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Slot', schema: SlotsSchema}])],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService]
})
export class SlotsModule {}
