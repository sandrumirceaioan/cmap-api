import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, UseGuards, Request } from '@nestjs/common';
import { BonusesService } from './bonuses.service';
import { Bonus } from './bonuses.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('bonuses')
export class BonusesController {

    constructor(private readonly bonusesService: BonusesService) { }

    @Post('/add')
    async add(@Body() bonus: Bonus) {
        let response = {
            data: await this.bonusesService.add(bonus),
            message: 'Bonus added!'
        };
        return response;
    }

    @Get('/all')
    async all(@Query() params) {
        return this.bonusesService.getAll();
    }

    @Get('/best')
    async getCasinoBestBonus(@Query() params) {
        return this.bonusesService.getCasinoBestBonus(params);
    }

    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.bonusesService.getOneById(id);
    }

    /* admin routes */
    @UseGuards(AuthGuard('jwt'))
    @Get('/count')
    async countDashboard(@Request() req) {
        return await this.bonusesService.countDashboard();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/list')
    async allPaginated(@Query() params) {
        return await this.bonusesService.allPaginated(params);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/edit')
    async getOneByIdAdmin(@Query('id') id) {
        return await this.bonusesService.getOneByIdAdmin(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Bonus) {
        let response = {
            data: await this.bonusesService.updateOneById(id, params),
            message: 'Casino updated!'
        };
        return response;
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.bonusesService.deleteOneById(id);
        console.log('deleted: ', deleted);
        if (deleted) return { message: 'Bonus ' + deleted.bonusName + ' deleted!' };
    }

}