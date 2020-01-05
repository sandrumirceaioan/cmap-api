import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { Country } from './countries.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('countries')
export class CountriesController {

    constructor(private readonly countriesService: CountriesService) { }

    @Post('/add')
    async add(@Body() casino: Country) {
        let response = {
            data: await this.countriesService.add(casino),
            message: 'Country added!'
        };
        return response;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    async all(@Request() req) {
        return this.countriesService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id){
        return this.countriesService.getOneById(id);
    }

    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Country) {
        let response = {
            data: await this.countriesService.updateOneById(id, params),
            message: 'Country updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.countriesService.deleteOneById(id);
        console.log('deleted: ', deleted);
        if (deleted) return { message: 'Country '+ deleted.countryName +' deleted!' };
    }

}