import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as request from 'request';
import { eachLimit, mapLimit } from 'async';
import { CasinosService } from '../casinos/casinos.service';
import * as fs from 'fs';
import { join, posix } from 'path';
import * as fetch from 'node-fetch';
import * as puppeteer from 'puppeteer';
import * as _ from 'underscore';

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
        list = [list[0]];
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
                waitUntil: 'load', timeout: 0
            });
            let html = await page.content();
            const $ = cheerio.load(html);

            // casinoLogo
            item['casinoLogo'] = $('.ch-main').find('.ch-main__logo').attr('src');

            // casinoReputation
            item['casinoReputation'] = $('.ch-main').find('.ch-rating').text().replace(/\n/g, '').trim().split(' ')[0];

            // casinoBonusesUrl
            item['casinoBonusesUrl'] = $('#casinoBonuses').find('.top10__all').attr('href');

            // casinoPlayUrl
            item['casinoPlayUrl'] = $('.ch-main').find('.ch-cta-inline-buttons__play-now-container a').first().attr('href');

            // casinoWebsiteUrl
            item['casinoWebsiteUrl'] = $('.top10__term:contains("Website")').next().find('a').text().replace(/\n/g, '').trim();

            // casinoSpecs
            let positives = [];
            let negatives = [];
            $('.review-main__content').find('.review-pros li').each(function () {
                positives.push($(this).text());
            });
            $('.review-main__content').find('.review-cons li').each(function () {
                negatives.push($(this).text());
            });
            item['casinoSpecs'] = { negatives, positives };

            // casinoLanguages
            item['casinoLanguages'] = [];
            $('.top10__term:contains("Languages")').next().find('a').each(function () {
                item['casinoLanguages'].push($(this).text().replace(/\n/g, '').trim());
            });

            // casinoLiveChat
            item['casinoLiveChat'] = $('.top10__term:contains("Live Chat")').next().find('a').text().replace(/\n/g, '').trim();

            // casinoContact
            item['casinoContact'] = { email: '', phone: '' };
            $('.top10__term:contains("Contact")').next().find('p').each(function () {
                let contact = $(this).find('a').text().replace(/\n/g, '').trim();
                if (contact) {
                    if (contact.indexOf('@') != -1) {
                        item['casinoContact'].email = contact;
                    } else {
                        item['casinoContact'].phone = contact;
                    }
                }
            });

            // casinoOwner
            item['casinoOwner'] = $('.top10__term:contains("Owner")').next().find('a').text().replace(/\n/g, '').trim();

            // casinoEstablished
            item['casinoEstablished'] = $('.top10__term:contains("Established")').next().find('a').text().replace(/\n/g, '').trim();

            // casinoWithdrawalLimit
            item['casinoWithdrawalLimit'] = $('.top10__term:contains("Withdrawal Limit")').next().find('a').text().replace(/\n/g, '').trim();

            // casinoLicensingAuthorities
            item['casinoLicensingAuthorities'] = [];
            $('.top10__term:contains("Licences")').next().find('a').each(function () {
                item['casinoLicensingAuthorities'].push($(this).text().replace(/\n/g, '').trim());
            });

            // casinoRestrictedCountries
            item['casinoRestrictedCountries'] = [];
            let allCountriesAndStates = [];
            let allStates = [];
            $('.top10__term:contains("Restricted Countries")').next().find('.column-list li').each(function () {
                let country = {};
                let states = [];

                let hasStates = $(this).find('.toggle-states');
                if (hasStates.length > 0) {
                    country['name'] = $(this).text().replace(/\n/g, '').split('[')[0].trim();
                    $(this).find('.state-list li').each(function () {
                        states.push($(this).text().replace(/\n/g, '').trim());
                    });
                    country['states'] = states;
                    allStates = allStates.concat(states);
                } else {
                    country['name'] = $(this).text().replace(/\n/g, '').trim();
                }
                allCountriesAndStates.push(country);
            });
            for (let i = 0, l = allCountriesAndStates.length; i < l; i++) {
                if (!_.contains(allStates, allCountriesAndStates[i].name)) {
                    item['casinoRestrictedCountries'].push(allCountriesAndStates[i]);
                }
            }

            // casinoType
            item['casinoType'] = [];
            $('.top10__term:contains("Casino Type")').next().find('a').each(function () {
                item['casinoType'].push($(this).text().replace(/\n/g, '').trim());
            });

            // casinoAffiliateProgram 
            let casinoAffiliate = $('.top10__term:contains("Affiliate Program")').next().find('a');
            item['casinoAffiliateProgram'] = {
                name: $(casinoAffiliate).text().replace(/\n/g, '').trim(),
                url: $(casinoAffiliate).attr('href')
            };

            // casinoRtp
            item['casinoRtp'] = $('.top10__term:contains("RTP")').next().find('a').text().replace(/\n/g, '').trim();

            // casinoCurrencies
            item['casinoCurrencies'] = [];
            $('.top10__term:contains("Currencies")').next().find('a').each(function () {
                item['casinoCurrencies'].push($(this).text().replace(/\n/g, '').trim());
            });

            // casinoSoftwareProviders
            item['casinoSoftwareProviders'] = [];
            $('.top10__term:contains("Software")').next().find('a').each(function () {
                item['casinoSoftwareProviders'].push({
                    name: $(this).text().replace(/\n/g, '').trim(),
                    url: $(this).attr('href')
                });
            })
            // casinoDepositMethods
            item['casinoDepositMethods'] = [];
            $('.top10__term:contains("Deposit Methods")').next().find('a').each(function () {
                item['casinoDepositMethods'].push({
                    name: $(this).text().replace(/\n/g, '').trim(),
                    url: $(this).attr('href')
                });
            });

            // casinoWithdrawalMethods
            item['casinoWithdrawalMethods'] = [];
            $('.top10__term:contains("Withdrawal Methods")').next().find('a').each(function () {
                item['casinoWithdrawalMethods'].push({
                    name: $(this).text().replace(/\n/g, '').trim(),
                    url: $(this).attr('href')
                });
            });

            // close headless browser and done process one
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




