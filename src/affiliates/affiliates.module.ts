import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { AffiliatesSchema } from './affiliates.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Affiliate', schema: AffiliatesSchema}])],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService]
})
export class AffiliatesModule {}
