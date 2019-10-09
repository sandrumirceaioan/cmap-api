import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as request from 'request';
import { eachLimit } from 'async';

@Injectable()
export class ScrapperService {

    constructor() {
    }

    async scrapeUrl(data): Promise<any> {
        let url = 'https://casino.guru/casinoFilterServiceMore?page=';
        let urls = [];
        let all = [];
        for (let i = 0; i < 227; i++) {
            urls.push(url + (i + 1));
        }
        return new Promise((resolve, reject) => {
            // assuming openFiles is an array of file names
            eachLimit(urls, 100, (url, callback) => {

                this.processUrl(url).then((result) => {
                    all = all.concat(result);
                    callback();
                }).catch((error) => {
                    callback(error);
                });

            }, (err) => {
                if (err) {
                    return console.log('ERROR', err);
                } else {
                    console.log(all.length);
                    resolve(all);
                }
            });
        });


    }

    processUrl(url) {
        return new Promise((resolve, reject) => {
            request.post({
                uri: url,
                form: {
                    tab: 'ALL'
                }
            }, function (error, response, body) {
                if (error) return reject(error);
                const $ = cheerio.load(body);
                const items = [];
                console.log(url, $('.casino-card').length);
                $('.casino-card').each(function(){
                    items.push({
                        title: $(this).find('.casino-card-heading a').text(),
                        href: $(this).find('.casino-card-heading a').attr('href'),
                        image:  $(this).find('.casino-card-logo img').attr('src')
                    });
                });
                resolve(items);
            });

        });
    }



}




