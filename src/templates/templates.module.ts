import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplatesSchema } from './templates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Template', schema: TemplatesSchema}]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService]
})
export class TemplatesModule {}
