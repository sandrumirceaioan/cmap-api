import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards, HttpException, HttpStatus, Res } from '@nestjs/common';
import { CasinosService } from './casinos.service';
import { Casino } from './casinos.interface';
import { AuthGuard } from '@nestjs/passport';
import * as express from 'express';

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
    async all(@Request() req) {
        return this.casinosService.getAll();
    }

    @Get('/best')
    async best(@Request() req) {
        return this.casinosService.getBest();
    }

    @Get('/all/active')
    async allActive(@Request() req) {
        return this.casinosService.getAllActive();
    }

    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.casinosService.getOneById(id);
    }

    @Get()
    async getOneByUrl(@Query() params) {
        let casino = await this.casinosService.getOneByUrl(params);
        if (!casino) throw new HttpException('Casino not available.', HttpStatus.NOT_FOUND);
        return casino;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.casinosService.deleteOneById(id);
        console.log('deleted: ', deleted);
        if (deleted) return { message: 'Casino ' + deleted.casinoName + ' deleted!' };
    }

    // @Post('/terms/:url')
    // async postAuthRequest(@Param('url') url, @Res() response: express.Response) {
    //     console.log(url);
    //     const newUrl = await this.casinosService.getCasinoTermsUrl(url);
    //     return response.redirect(303, newUrl.casinoTermsUrl);
    // }

    /* admin routes */
    @UseGuards(AuthGuard('jwt'))
    @Get('/count')
    async countDashboard(@Request() req) {
        return await this.casinosService.countDashboard();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/list')
    async allPaginated(@Query() params) {
        return await this.casinosService.allPaginated(params);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/edit')
    async getOneByIdAdmin(@Query('id') id) {
        return await this.casinosService.getOneByIdAdmin(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/update-payment-methods-data')
    async updatePaymentMethodsData(@Body() params) {
        let response = await this.casinosService.updatePaymentMethodsData(params);
        if (!response) throw new HttpException('Payment methods update data error!', HttpStatus.BAD_REQUEST);
        return {
            data: response,
            message: 'Payment methods updated!'
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Casino) {
        let response = {
            data: await this.casinosService.updateOneById(id, params),
            message: 'Casino updated!'
        };
        return response;
    }

}