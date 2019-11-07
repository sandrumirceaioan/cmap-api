import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as request from 'request';
import { eachLimit, mapLimit } from 'async';
import { CasinosService } from '../casinos/casinos.service';
import * as fs from 'fs';
import { join, posix } from 'path';
import * as fetch from 'node-fetch';
import * as puppeteer from 'puppeteer';

const chromeOptions = {
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true
};

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
        for (let i = 1; i < 1; i++) {
            urls.push(urls[0] + '/' + (i + 1));
        }

        return new Promise((resolve, reject) => {
            eachLimit(urls, 10, (url, callback) => {
                this.processUrl(url).then((result) => {
                    all = all.concat(result);
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

            mapLimit(list, 8, async (item) => {

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
        return new Promise(async (resolve, reject) => {
            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();

            await page.goto('https://www.askgamblers.com' + item.casinoUrlDetails, {
                waitUntil: 'load', timeout: 0 });
            let html = await page.content();
            const $ = cheerio.load(html);
            item['casinoLogo'] = $('.ch-main').find('.ch-main__logo').attr('src');
            item['casinoReputation'] = $('.ch-main').find('.ch-rating').text().replace(/\n/g, '').trim().split(' ')[0];
            item['casinoBonusesUrl'] = $('#casinoBonuses').find('.top10__all').attr('href');
            item['casinoPlayUrl'] = $('.ch-main').find('.ch-cta-inline-buttons__play-now-container a').first().attr('href');
            let positives = [];
            let negatives = [];
            $('.review-main__content').find('.review-pros li').each(function () {
                positives.push($(this).text());
            });
            $('.review-main__content').find('.review-cons li').each(function () {
                negatives.push($(this).text());
            });
            item['casinoSpecs'] = { negatives, positives };
            console.log(positives, negatives);
            await browser.close();
            resolve(item);
        });
    }

    processUrl(url) {
        console.log(url);
        console.log('----------------------------------');

        return new Promise(async (resolve, reject) => {
            let casinos = [];
            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();

            await page.goto(url);
            let html = await page.content();

            const $ = cheerio.load(html);
            $('.card__desc').each(function () {
                casinos.push({
                    casinoName: $(this).find('.title').text(),
                    casinoScore: $(this).find('.star-rating--after').text(),
                    casinoUrlDetails: $(this).find('a').first().attr('href')
                });
            });

            await browser.close();
            resolve(casinos);
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

    // getCasinoRealUrl(fakeUrl) {
    //     let link = 'https://www.askgamblers.com' + fakeUrl;
    //     let realUrl;
    //     return new Promise(async (resolve, reject) => {
    //         const browser = await puppeteer.launch(chromeOptions);
    //         const page = await browser.newPage();
    //         const response = await page.goto(link);
    //         console.log(response.status());
    //         const redirects = await response.request().redirectChain();
    //         realUrl = redirects[0].url();
    //         await browser.close();
    //         resolve(realUrl);
    //     });
    // }

}




