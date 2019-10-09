import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CasinosController } from './casinos.controller';
import { CasinosService } from './casinos.service';
import { CasinosSchema } from './casinos.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Casino', schema: CasinosSchema}])],
  controllers: [CasinosController],
  providers: [CasinosService],
  exports: [CasinosService]
})
export class CasinosModule {}
