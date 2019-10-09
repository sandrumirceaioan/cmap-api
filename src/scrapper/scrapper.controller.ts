import { Controller, Post, Get, Put, Body, Query, Param } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';

@Controller('scrapper')
export class ScrapperController {

    
    constructor(private readonly scrapperService: ScrapperService){}

    @Post('/casino-guru-main-list') // https://casino.guru/casinoFilterServiceMore?page=1
    async scrape(@Body() data){
        return this.scrapperService.scrapeUrl(data);
    }

}