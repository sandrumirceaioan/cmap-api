import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete } from '@nestjs/common';
import { CasinosService } from './casinos.service';
import { Casino } from './casinos.interface';

@Controller('casinos')
export class CasinosController {

    constructor(private readonly casinosService: CasinosService) { }

    @Post('/add')
    async add(@Body() casino: Casino) {
        let response = {
            data: await this.casinosService.add(casino),
            message: 'Casino added!'
        };
        return response;
    }

    @Get('/all')
    async all(@Query() params) {
        return this.casinosService.getAll();
    }

    @Get('/oneById/:id')
    async getOneById(@Param('id') id){
        return this.casinosService.getOneById(id);
    }

    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Casino) {
        let response = {
            data: await this.casinosService.updateOneById(id, params),
            message: 'Category updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.casinosService.deleteOneById(id);
        console.log('deleted: ', deleted);
        if (deleted) return { message: 'Casino '+ deleted.casinoName +' deleted!' };
    }

}