import { Controller, Post, Get, Put, Body, Query, Param } from '@nestjs/common';
import { ScrapperCasinoGuruService } from './scrapper-casinoguru.service';
import { ScrapperAskGamblersService } from './scrapper-askgamblers.service';

@Controller('scrapper')
export class ScrapperController {

    
    constructor(
        private readonly scrapperCasinoGuruService: ScrapperCasinoGuruService,
        private readonly scrapperAskGamblersService: ScrapperAskGamblersService
        ){}

    @Post('/casinoguru')
    async scrapeGuru(@Body() data){
        return this.scrapperCasinoGuruService.scrapeUrl(data);
    }

    @Post('/askgamblers')
    async scrapeGamblers(@Body() data){
        return this.scrapperAskGamblersService.scrapeUrl();
    }

    @Post('/askgamblers/bonuses')
    async getBonuses(@Body() data){
        return this.scrapperAskGamblersService.getBonuses();
    }

}