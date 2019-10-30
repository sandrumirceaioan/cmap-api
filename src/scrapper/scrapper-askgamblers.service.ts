import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as request from 'request';
import { eachLimit, mapLimit } from 'async';
import { CasinosService } from '../casinos/casinos.service';
import * as fs from 'fs';
import { join, posix } from 'path';
import * as fetch from 'node-fetch';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScrapperAskGamblersService {

    constructor(
        private casinosService: CasinosService
    ) {
    }

    async scrapeUrl(data): Promise<any> {
        let urls = [];
        urls[0] = 'https://www.askgamblers.com/online-casino-reviews'
        let all = [];
        for (let i = 1; i < 5; i++) {
            urls.push(urls[0] + '/' + (i + 1));
        }

        return new Promise((resolve, reject) => {
            eachLimit(urls, 10, (url, callback) => {
                this.processUrl(url).then((result) => {
                    // this.saveCasino(result).then((cas) => {
                    //     all = all.concat(cas);
                    //     callback();
                    // });
                    callback();
                }).catch((error) => {
                    callback(error);
                });
            }, async (err) => {
                if (err) {
                    return console.log('SCRAPE ERROR', err);
                } else {
                    let data = await this.scrapePages(all);
                    console.log('final result: ', data);
                    resolve(data);
                }
            });
        });
    }

    scrapePages(list) {
        return new Promise((resolve, reject) => {

            mapLimit(list, 5, async (item) => {

                let oneCasino = await this.processOne(item);
                return Promise.resolve(oneCasino);

            }, (err, result) => {
                if (err) {
                    return console.log('SCRAPE PAGES ERROR', err);
                } else {
                    resolve(result);
                }
            });

        });
    }

    processOne(item) {
        return new Promise((resolve, reject) => {
            request.post({
                uri: item,
            }, function (error, response, body) {
                if (error) return reject(error);
                const $ = cheerio.load(body);
                const items = [];
                $('.casino-card').each(function () {
                    let status = $(this).find('.text-bold strong').text();
                    if (status != 'closed') {
                        items.push({
                            title: $(this).find('.casino-card-heading a').text().replace("[\\n\\r\\t]+", ""),
                            href: $(this).find('.casino-card-heading a').attr('href'),
                            image: $(this).find('.casino-card-logo img').attr('src')
                        });
                    }
                });
                resolve(items);
            });
        });
    }

    processUrl(url) {
        console.log(url);
        console.log('----------------------------------');
        const chromeOptions = {
            headless: false,
            defaultViewport: null
        };

        return new Promise(async (resolve, reject) => {

            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();
     
            await page.goto(url);
            let html = await page.content();
        
            const $ = cheerio.load(html);
            $('.card__desc').each(function () {
                let title = $(this).find('.title').text();
                console.log(title);
            });

    
            await browser.close();

            // const browser = await puppeteer.launch(chromeOptions);
            // try {
            //     puppeteer
            //         .launch(chromeOptions)
            //         .then(browser => browser.newPage())
            //         .then(page => {
            //             return page.goto(url).then(function () {
            //                 return page.content();
            //             });
            //         })
            //         .then(html => {
            //             const $ = cheerio.load(html);
            //             $('.card__desc').each(function () {
            //                 let title = $(this).find('.title').text();
            //                 console.log(title);
            //             });
            //             resolve();
            //         })
            //         .catch(console.error);
            // } finally {
            //     browser.close();
            // }
        });
    }

    // saveCasino(casinos) {
    //     return new Promise((resolve, reject) => {
    //         mapLimit(casinos, 5, async (cs) => {

    //             let parsedSrc = new URL(cs.image.toString());
    //             let fn = parsedSrc.origin + parsedSrc.pathname;
    //             let originalFileName = parsedSrc.pathname.split('/')[3] + '.jpg';

    //             let casino = await this.casinosService.add({
    //                 casinoName: cs.title,
    //                 casinoUrlDetails: cs.href,
    //                 casinoLogo: originalFileName
    //             });

    //             await this.uploadFile(fn, originalFileName);

    //             return Promise.resolve(casino);
    //         }, (err, result) => {
    //             if (err) {
    //                 return console.log('SCRAPE ERROR', err);
    //             } else {
    //                 resolve(result);
    //             }
    //         });
    //     });
    // }

    // uploadFile(document, fileName) {
    //     return new Promise(async (resolve, reject) => {
    //         let filePath = '/assets/casinos/';

    //         if (!fs.existsSync(join(process.cwd(), filePath))) fs.mkdirSync(join(process.cwd(), filePath), { recursive: true });

    //         let fullPath = join(process.cwd(), filePath, fileName);

    //         request({
    //             method: 'HEAD',
    //             url: document,
    //             followRedirect: false
    //         }, async (err, resp) => {
    //             if (err || resp.statusCode !== 200) return resolve();
    //             const response = await fetch(document);
    //             let writer = fs.createWriteStream(fullPath);
    //             response.body.pipe(writer);
    //             writer.on('finish', async (result) => {
    //                 writer.end();
    //                 resolve();
    //             });
    //             writer.on('error', (error) => {
    //                 resolve();
    //                 writer.end();
    //             });
    //         });

    //     });
    // }

}




