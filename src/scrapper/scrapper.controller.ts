import { Controller, Post, Get, Put, Body, Query, Param } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';

@Controller('scrapper')
export class ScrapperController {

    
    constructor(private readonly scrapperService: ScrapperService){}

    @Post('/url')
    async scrape(@Body() data){
        return this.scrapperService.scrapeUrl(data);
    }

}