import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { Slot } from './slots.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('slots')
export class SlotsController {

    constructor(private readonly slotsService: SlotsService) { }

    @Post('/add')
    async add(@Body() bonus: Slot) {
        let response = {
            data: await this.slotsService.add(bonus),
            message: 'Slot added!'
        };
        return response;
    }

    @Get('/all')
    async all(@Request() req) {
        return this.slotsService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.slotsService.getOneById(id);
    }

    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Slot) {
        let response = {
            data: await this.slotsService.updateOneById(id, params),
            message: 'Slot updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.slotsService.deleteOneById(id);
        if (deleted) return { message: 'Slot ' + deleted.slotName + ' deleted!' };
    }

    /* admin routes */
    @UseGuards(AuthGuard('jwt'))
    @Get('/count')
    async countDashboard(@Request() req) {
        return await this.slotsService.countDashboard();
    }

}