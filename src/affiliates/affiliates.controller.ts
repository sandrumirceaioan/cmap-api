import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { Affiliate } from './affiliates.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('affiliates')
export class AffiliatesController {

    constructor(private readonly affiliatesService: AffiliatesService) { }

    @Post('/add')
    async add(@Body() affiliate: Affiliate) {
        let response = {
            data: await this.affiliatesService.add(affiliate),
            message: 'Bonus added!'
        };
        return response;
    }

    @Get('/all')
    async all(@Request() req) {
        return this.affiliatesService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.affiliatesService.getOneById(id);
    }

    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Affiliate) {
        let response = {
            data: await this.affiliatesService.updateOneById(id, params),
            message: 'Affiliate updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.affiliatesService.deleteOneById(id);
        console.log('deleted: ', deleted);
        if (deleted) return { message: 'Affiliate ' + deleted.affiliateName + ' deleted!' };
    }

    /* admin routes */
    @UseGuards(AuthGuard('jwt'))
    @Get('/count')
    async countDashboard(@Request() req) {
        return await this.affiliatesService.countDashboard();
    }

}