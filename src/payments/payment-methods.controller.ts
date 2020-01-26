import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards, UseInterceptors, HttpException, HttpStatus, UploadedFile } from '@nestjs/common';
import { PaymentMethodsService } from './paymet-methods.service';
import { PaymentMethod } from './payment-methods.interface';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Controller('payments')
export class PaymentMethodsController {

    constructor(private readonly paymentMethodsService: PaymentMethodsService) { }

    @Post('/add')
    async add(@Body() paymentMethod: PaymentMethod) {
        let response = {
            data: await this.paymentMethodsService.add(paymentMethod),
            message: 'Payment method added!'
        };
        return response;
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    async all(@Request() req) {
        return this.paymentMethodsService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.paymentMethodsService.getOneById(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('paymentMethodLogo', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, './assets/payments');
            },
            filename: (req, file, cb) => {
                cb(null, `${file.originalname}`)
            }
        }),
        fileFilter: (req, file, cb) => {
            let ext = extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return cb(new HttpException('Only images are allowed!', HttpStatus.BAD_REQUEST), null);
            }
            cb(null, true);
        },
    }),
    )
    @Put('/update')
    async updateOneById(@Request() req, @UploadedFile() file) {
        let updateObject = {
            paymentMethodName: req.body.paymentMethodName,
            paymentMethodWebsite: req.body.paymentMethodWebsite,
        };

        if (req.body.paymentMethodWebsite != 'null' && file) {
            updateObject['paymentMethodLogo'] = file.originalname;
        }

        let response = {
            data: await this.paymentMethodsService.updateOneById(req.body._id, updateObject),
            message: 'Payment updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.paymentMethodsService.deleteOneById(id);
        if (deleted) return { message: 'Payment Method ' + deleted.slotName + ' deleted!' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/search')
    async searchPayments(@Query() params) {
        return this.paymentMethodsService.searchPayments(params);
    }

}