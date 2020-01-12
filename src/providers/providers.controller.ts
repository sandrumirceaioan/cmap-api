import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { Provider } from './providers.interface';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

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

    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    async all(@Request() req) {
        return this.providersService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.providersService.getOneById(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('providerLogo', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, './assets/providers');
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
            providerName: req.body.providerName,
            providerWebsite: req.body.providerWebsite,
        };

        if (req.body.providerWebsite != 'null' && file) {
            updateObject['providerLogo'] = file.originalname;
        }

        let response = {
            data: await this.providersService.updateOneById(req.body._id, updateObject),
            message: 'Provider updated!'
        };
        return response;
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.providersService.deleteOneById(id);
        if (deleted) return { message: 'Provider ' + deleted.slotName + ' deleted!' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/casino')
    async getManyByCasino(@Param('id') id) {
        return this.providersService.getManyByCasino(id);
    }
}