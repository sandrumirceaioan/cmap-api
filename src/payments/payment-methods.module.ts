import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './paymet-methods.service';
import { PaymentMethodsSchema } from './payment-methods.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'PaymentMethod', schema: PaymentMethodsSchema}]),
  ],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService]
})
export class PaymentMethodsModule {}
