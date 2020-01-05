import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProvidersSchema } from './providers.schema';
import { CasinosModule } from '../casinos/casinos.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Provider', schema: ProvidersSchema}]),
    CasinosModule
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService]
})
export class ProvidersModule {}
