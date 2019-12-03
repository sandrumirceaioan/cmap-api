import { Controller, Post, Get, Put, Body, Query, Param } from '@nestjs/common';
import { SlotsAskgamblersService } from './slots-askgamblers.service';

@Controller('scrapper')
export class ScrapperController {
    
    constructor(
            private slotsAskgamblersService: SlotsAskgamblersService
        ){}

        @Post('/askgamblers/missing')
        async missing(@Body() data){
            return this.slotsAskgamblersService.downloadMissingImages();
        }

}