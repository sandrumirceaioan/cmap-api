import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CasinosController } from './casinos.controller';
import { CasinosService } from './casinos.service';
import { CasinosSchema } from './casinos.schema';
import { PaymentMethodsModule } from '../payments/payment-methods.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Casino', schema: CasinosSchema}]),
    PaymentMethodsModule
  ],
  controllers: [CasinosController],
  providers: [CasinosService],
  exports: [CasinosService]
})
export class CasinosModule {}
