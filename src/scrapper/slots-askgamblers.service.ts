import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as request from 'request';
import { eachLimit, map, mapLimit } from 'async';
import { CasinosService } from '../casinos/casinos.service';
import * as fs from 'fs';
import { join, posix } from 'path';
import * as fetch from 'node-fetch';
import * as puppeteer from 'puppeteer';
import * as _ from 'underscore';
import { SlotsService } from '../slots/slots.service';

const chromeOptions = {
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true
};

@Injectable()
export class SlotsAskgamblersService {
    slotsScrapped = 0;
    missingDownloaded = 1;
    constructor(
        private slotsService: SlotsService
    ) {
    }

    async onModuleInit() {
    }

    async scrapeSlots(): Promise<any> {
        return new Promise((resolve, reject) => {
            let urls = [];
            let startUrl = 'https://www.askgamblers.com/free-online-slots';
            for (let i = 256; i < 282; i++) {
                urls.push(startUrl + '/' + (i + 1));
            }

            mapLimit(urls, 2, async (url) => {
                let processedPage = await this.processUrl(url);
                return Promise.resolve(processedPage);
            }, async (err, result) => {
                if (err) {
                    console.log('SCRAPE ERROR', err);
                } else {
                    console.log('SCRAPE DONE:', result.length);
                    return resolve(result);
                }
            });
        });
    }

    processUrl(url) {
        console.log('----------------------------------');
        console.log(url);

        return new Promise(async (resolve, reject) => {
            let pageSlots = [];
            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();
            try {
                await page.goto(url, {
                    waitUntil: 'networkidle0', timeout: 0
                });
            } catch (err) {
                page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            }
            let html = await page.content();

            // create array with all slots on a single page
            const $ = cheerio.load(html);
            $('.card__front').each(function () {
                let obj = {
                    slotName: $(this).find('.card__desc-title').text(),
                    slotUrlDetails: $(this).find('a').first().attr('href'),
                    slotLogo: $(this).find('.card__media img').attr('src')
                };

                if (!obj.slotLogo || obj.slotLogo == 'undefined') {
                    obj.slotLogo = $(this).find('.card__media--full img').attr('src');
                }

                pageSlots.push(obj);
            });

            await page.waitFor(500);
            await browser.close();

            // simulate for 2 slots per page
            // pageSlots = [pageSlots[0], pageSlots[1]];

            // send each casino from current page to scrape
            mapLimit(pageSlots, 5, async (slot) => {
                let processedSlot = await this.processSlot(slot);
                try {
                    let initialLogoUrl = processedSlot['slotLogo'];
                    let initialScreenshotUrl = processedSlot['slotScreenshot'];

                    if (initialLogoUrl.indexOf('askgamblers.com') == -1) {
                        initialLogoUrl = 'https://www.askgamblers.com' + initialLogoUrl;
                    }

                    if (initialScreenshotUrl.indexOf('askgamblers.com') == -1) {
                        initialScreenshotUrl = 'https://www.askgamblers.com' + initialScreenshotUrl;
                    }

                    // clone original Logo url - needed for download
                    let parsedLogoUrl = new URL(initialLogoUrl.toString());
                    let downloadLogoUrl = parsedLogoUrl.origin + parsedLogoUrl.pathname;

                    // clone original Screenshot url - needed for download
                    let parsedScreenshotUrl = new URL(initialScreenshotUrl.toString());
                    let downloadScreenshotUrl = parsedScreenshotUrl.origin + parsedScreenshotUrl.pathname;

                    // save into db relative path - last part of original url
                    processedSlot['slotLogo'] = parsedLogoUrl.pathname.split('/').pop();
                    processedSlot['slotLogoUrl'] = downloadLogoUrl;
                    processedSlot['slotScreenshot'] = parsedScreenshotUrl.pathname.split('/').pop();
                    processedSlot['slotScreenshotUrl'] = downloadScreenshotUrl;

                    // save slot into db
                    let casino = await this.slotsService.add(processedSlot);

                    // if casino saved download logo and screenshot
                    if (casino) {
                        await this.uploadFile(downloadLogoUrl, processedSlot['slotLogo'], 'logo');
                        await this.uploadFile(downloadScreenshotUrl, processedSlot['slotScreenshot'], 'screenshot');
                        console.log(this.slotsScrapped++);
                    }
                    return Promise.resolve(casino);
                } catch (err) {
                    return Promise.resolve();
                }

            }, async (err, result) => {
                if (err) {
                    console.log('PAGE ERROR', err);
                } else {
                    console.log('PAGS DONE');
                    return resolve(result);
                }
            });
        });
    }

    async processSlot(oneSlot) {
        return new Promise(async (resolve, reject) => {

            let slot: any = {};
            slot['slotName'] = oneSlot.slotName;
            slot['slotUrlDetails'] = oneSlot.slotUrlDetails;
            slot['slotLogo'] = oneSlot.slotLogo;

            // scrape slot page
            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();
            try {
                await page.goto('https://www.askgamblers.com' + slot.slotUrlDetails, {
                    waitUntil: 'domcontentloaded', timeout: 0
                });
            } catch (err) {
                page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            }


            let html = await page.content();
            const $ = cheerio.load(html);

            // slotScreenshot
            slot['slotScreenshot'] = $('.slotchosen-content img').attr('src');

            // slotSoftware
            slot['slotSoftware'] = $('.top10__term:contains("Software")').next().find('a').text().replace(/\n/g, '').trim();

            // slotType
            slot['slotType'] = $('.top10__term:contains("Slot Type")').next().find('a').text().replace(/\n/g, '').trim();

            // slotSpecialFeature
            let features = [];
            $('.info-table__cell--special--feature td').find('a').each(function () {
                let feature = $(this).text().replace(/\n/g, '').trim();
                features.push(feature);
            });
            slot['slotSpecialFeatures'] = features;

            // slotPaylines
            slot['slotPaylines'] = $('.top10__term:contains("Paylines")').next().find('a').text().replace(/\n/g, '').trim();

            // slotReels
            slot['slotReels'] = $('.top10__term:contains("Reels")').next().find('a').text().replace(/\n/g, '').trim();

            // slotMinCoinPerLine
            slot['slotMinCoinPerLine'] = $('.top10__term:contains("Min Coins Per Line")').next().find('a').text().replace(/\n/g, '').trim();

            // slotMaxCoinPerLine
            slot['slotMaxCoinPerLine'] = $('.top10__term:contains("Max Coins Per Line")').next().find('a').text().replace(/\n/g, '').trim();

            // slotMinCoinSize
            slot['slotMinCoinSize'] = $('.top10__term:contains("Min Coins Size")').next().find('a').text().replace(/\n/g, '').trim();

            // slotMaxCoinSize
            slot['slotMaxCoinSize'] = $('.top10__term:contains("Max Coins Size")').next().find('a').text().replace(/\n/g, '').trim();

            // slotJackpot
            slot['slotJackpot'] = $('.top10__term:contains("Jackpot")').next().find('a').text().replace(/\n/g, '').trim();

            // slotRtp
            slot['slotRtp'] = $('.top10__term:contains("RTP")').next().find('a').text().replace(/\n/g, '').trim();

            // slotBonusGame
            slot['slotBonusGame'] = $('.top10__term:contains("Bonus Game")').next().find('a').text().replace(/\n/g, '').trim();

            // slotProgressive
            slot['slotProgressive'] = $('.top10__term:contains("Progressive")').next().find('a').text().replace(/\n/g, '').trim();

            // slotWildSymbol
            slot['slotWildSymbol'] = $('.top10__term:contains("Wild Symbol")').next().find('a').text().replace(/\n/g, '').trim();

            // slotScatterSymbol
            slot['slotScatterSymbol'] = $('.top10__term:contains("Scatter Symbol")').next().find('a').text().replace(/\n/g, '').trim();

            // slotAutoPlayOption
            slot['slotAutoPlayOption'] = $('.top10__term:contains("Autoplay Option")').next().find('a').text().replace(/\n/g, '').trim();

            // slotMultiplier
            slot['slotMultiplier'] = $('.top10__term:contains("Multiplier")').next().find('a').text().replace(/\n/g, '').trim();

            // slotFreeSpins
            slot['slotFreeSpins'] = $('.top10__term:contains("Free Spins")').next().find('a').text().replace(/\n/g, '').trim();

            // close headless browser and done process one
            await page.waitFor(500);
            await browser.close();

            resolve(slot);
        });
    }


    // async downloadMissingImages(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let missing = await this.slotsService.checkImages();

    //             console.log(missing.length);

    //         mapLimit(missing, 3, async (image) => {
    //             let parsedLogoUrl = new URL(image.toString());
    //             let downloadLogoUrl = parsedLogoUrl.origin + parsedLogoUrl.pathname;

    //             let fileName = parsedLogoUrl.pathname.split('/').pop();

    //             let downloaded = await this.uploadFile(downloadLogoUrl, fileName, 'screenshot');
    //             console.log(this.missingDownloaded++);
                
    //             return Promise.resolve();
    //         }, (error, result) => {
    //             if (error) {
    //                 console.log(error);
    //             } else {
    //                 console.log(result.length);
    //                 return resolve();
    //             }
    //         });

    //     });
    // }

    uploadFile(document, fileName, folder) {
        return new Promise(async (resolve, reject) => {
            try {
                let filePath = '/assets/slots/' + folder + '/';

                if (!fs.existsSync(join(process.cwd(), filePath))) fs.mkdirSync(join(process.cwd(), filePath), { recursive: true });

                let fullPath = join(process.cwd(), filePath, fileName);
                // console.log('fullPath: ', fullPath);
                // console.log('filePath: ', filePath);
                // console.log('fileName: ', fileName);
                const browser = await puppeteer.launch(chromeOptions);
                const page = await browser.newPage();
                page.setViewport({ width: 1280, height: 926 });

                page.on('response', async (response) => {
                    const matches = /.*\.(jpg|png|svg|gif|JPG|PNG|SVG|GIF)$/.exec(response.url());
                    if (matches && (matches.length === 2)) {
                        const buffer = await response.buffer();
                        // console.log(buffer);
                        fs.writeFileSync(fullPath, buffer);
                    }
                });

                    await page.goto(document, {
                        waitUntil: 'networkidle0', timeout: 0
                    });

                await page.waitFor(300);
                await browser.close();

                resolve();
            } catch (err) {
                resolve();
            }
        });
    }


}
