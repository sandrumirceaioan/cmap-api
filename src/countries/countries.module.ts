import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { CountriesSchema } from './countries.schema';
import { CasinosModule } from '../casinos/casinos.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Countrie', schema: CountriesSchema}]),
    CasinosModule
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService]
})
export class CountriesModule {}
