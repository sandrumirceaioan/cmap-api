import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './paymet-methods.service';
import { PaymentMethod } from './payment-methods.interface';

@Controller('providers')
export class PaymentMethodsController {

    constructor(private readonly paymentMethodsService: PaymentMethodsService) { }

    @Post('/add')
    async add(@Body() paymentMethod: PaymentMethod) {
        let response = {
            data: await this.paymentMethodsService.add(paymentMethod),
            message: 'Provider added!'
        };
        return response;
    }

    @Get('/all')
    async all(@Request() req) {
        return this.paymentMethodsService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.paymentMethodsService.getOneById(id);
    }

    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: PaymentMethod) {
        let response = {
            data: await this.paymentMethodsService.updateOneById(id, params),
            message: 'Payment Method updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.paymentMethodsService.deleteOneById(id);
        if (deleted) return { message: 'Payment Method ' + deleted.slotName + ' deleted!' };
    }

}