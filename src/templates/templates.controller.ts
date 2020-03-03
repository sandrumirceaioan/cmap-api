import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, Delete, Request, UseGuards, UseInterceptors, HttpException, HttpStatus, UploadedFile } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Template } from './templates.interface';

@Controller('templates')
export class TemplatesController {

    constructor(private readonly templatesService: TemplatesService) { }

    @Post('/add')
    async add(@Body() template: Template) {
        let response = {
            data: await this.templatesService.add(template),
            message: 'Template added!'
        };
        return response;
    }
    
    @Get('/all')
    async all(@Request() req) {
        return this.templatesService.getAll();
    }


    @Get('/oneById/:id')
    async getOneById(@Param('id') id) {
        return this.templatesService.getOneById(id);
    }

    @Put('/update/:id')
    async updateOneById(@Param('id') id, @Body() params: Template) {
        let response = {
            data: await this.templatesService.updateOneById(id, params),
            message: 'Template updated!'
        };
        return response;
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: string) {
        let deleted = await this.templatesService.deleteOneById(id);
        if (deleted) return { message: 'Template ' + deleted.tamplateName + ' deleted!' };
    }

}