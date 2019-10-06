import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import * as request from 'request';
import * as querystring from 'querystring';

@Injectable()
export class ScrapperService {

    constructor() {
    }

 
    async scrapeUrl(data): Promise<any> {
        let allitems = [];
        let url = data.url;
        let qs = 'method=FilterCasinos&FilterCasinosParams[resultsType]=reviews/all-online-casinos&FilterCasinosParams[resultsSubtype]=&FilterCasinosParams[userOptions][country]=false&FilterCasinosParams[userOptions][medals][gold]=false&FilterCasinosParams[userOptions][medals][silver]=false&FilterCasinosParams[userOptions][medals][bronze]=false&FilterCasinosParams[userOptions][medals][black]=false&FilterCasinosParams[userOptions][freeBonus]=false&FilterCasinosParams[userOptions][tags][BST]=false&FilterCasinosParams[userOptions][tags][POP]=false&FilterCasinosParams[userOptions][tags][NEW]=false&FilterCasinosParams[userOptions][tags][WRN]=false&FilterCasinosParams[userOptions][tags][BLC]=false&FilterCasinosParams[userOptions][tags][EXC]=false&FilterCasinosParams[userOptions][sortBy]=false&FilterCasinosParams[userOptions][offset]=500&FilterCasinosParams[userOptions][gamesWithoutFreePlay]=false';

        return new Promise(async (resolve, reject) => {
            request.post({
                uri: url,
                form: querystring.parse(qs)
            }, function (error, response, body) {
                const $ = cheerio.load(body);

                const items = [];
                $('.casino-list-row-casino > a').each(function () {
                    items.push({
                        title: $(this).text(),
                        href: $(this).attr('href')
                    });
                    resolve(items);
                });
            });
        });
    }

}

