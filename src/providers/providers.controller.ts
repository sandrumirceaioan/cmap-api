import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { Provider } from './providers.interface';

@Controller('providers')
export class ProvidersController {

    constructor(private readonly providersService: ProvidersService) { }

    @Post('/add')
    async add(@Body() bonus: Provider) {
        let response = {
            data: await this.providersService.add(bonus),
            message: 'Provider added!'
        };
        return response;
    }

    @Get('/all')
    async all(@Request() req) {
        return this.providersService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.providersService.getOneById(id);
    }

    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Provider) {
        let response = {
            data: await this.providersService.updateOneById(id, params),
            message: 'Provider updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.providersService.deleteOneById(id);
        if (deleted) return { message: 'Provider ' + deleted.slotName + ' deleted!' };
    }

}