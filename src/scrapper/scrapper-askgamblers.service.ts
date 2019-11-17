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
import * as htmlToText from 'html-to-text';
import { BonusesService } from '../bonuses/bonuses.service';

const chromeOptions = {
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true
};

@Injectable()
export class ScrapperAskGamblersService {
    casinoBonusesCount = 0;
    constructor(
        private casinosService: CasinosService,
        private bonusesService: BonusesService
    ) {
    }

    async onModuleInit() {
        // let result = await this.scrapeUrl();
        // console.log(result.length);
        // await this.getBonuses();
        // this.processBonuses('https://www.askgamblers.com/online-casinos/betsson-casino-casino-review/bonuses', 123);
        // this.filterData(); // delete duplicate casino
    }


    // START - MAIN SCRAPE ASKGAMBLERS

    async scrapeUrl(): Promise<any> {
        let urls = [];
        urls[0] = 'https://www.askgamblers.com/online-casino-reviews'
        let all = [];
        for (let i = 1; i < 62; i++) {
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
                    resolve(data);
                }
            });
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

            // casinoWithdrawalTimes
            item['casinoWithdrawalTimes'] = [];
            $('.top10__term:contains("Withdrawal Times")').next().find('p').each(function () {
                item['casinoWithdrawalTimes'].push({
                    type: $(this).text().replace(/\n/g, '').trim().split(':')[0],
                    duration: $(this).find('a').text().replace(/\n/g, '').trim()
                });
            });

            // save casino and logo
            let parsedSrc = new URL(item['casinoLogo'].toString());
            let logoUrl = parsedSrc.origin + parsedSrc.pathname;

            item['casinoLogo'] = parsedSrc.pathname.split('/').pop();
            let casino = await this.casinosService.add(item);

            if (casino) {
                await this.uploadFile(logoUrl, item['casinoLogo'])
            }

            // close headless browser and done process one
            await browser.close();
            resolve(casino);
        });
    }

    uploadFile(document, fileName) {
        console.log(document, fileName);
        return new Promise(async (resolve, reject) => {
            let filePath = '/assets/casinos/';

            if (!fs.existsSync(join(process.cwd(), filePath))) fs.mkdirSync(join(process.cwd(), filePath), { recursive: true });

            let fullPath = join(process.cwd(), filePath, fileName);

            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();
            page.setViewport({ width: 1280, height: 926 });

            page.on('response', async (response) => {
                const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());
                if (matches && (matches.length === 2)) {
                    const buffer = await response.buffer();
                    fs.writeFileSync(fullPath, buffer);
                }
            });

            await page.goto(document);
            await page.waitFor(200);

            await browser.close();

            resolve();
        });
    }

    // END - MAIN SCRAPE ASKGAMBLERS

    // START - BONUSES ASKBAMBLERS

    async getBonuses() {
        return new Promise(async (resolve, reject) => {
            let casinos = await this.casinosService.getAllActive();
            mapLimit(casinos, 1, async (casino) => {
                let processed = await this.processBonuses('https://www.askgamblers.com' + casino.casinoBonusesUrl, casino._id);
                return Promise.resolve(processed);
            }, (error, results) => {
                console.log('DONE FINAL');
                return resolve(results);
            });
        });
    }

    async processBonuses(bonusesUrl, casinoId) {
        return new Promise(async (resolve, reject) => {
            try {
                let bonuses: any = [];

                const browser = await puppeteer.launch(chromeOptions);
                const page = await browser.newPage();

                await page.goto(bonusesUrl, {
                    waitUntil: 'networkidle2', timeout: 0
                });
                let html = await page.content();

                // get list with each bonus URL
                const $ = cheerio.load(html);
                $('.card__desc-action-buttons').each(function () {
                    let status = $(this).text();
                    if (!status.includes('Expired') && !status.includes('Closed') && !status.includes('Terminated')) {
                        let url = $(this).find('a').first().attr('href');
                        bonuses.push(url);
                    }
                });
                await browser.close();

                // process each bonus
                mapLimit(bonuses, 5, async (bonus) => {
                    let processedBonus = await this.processOneBonus('https://www.askgamblers.com' + bonus, casinoId);
                    if (processedBonus) return Promise.resolve(processedBonus);
                }, async (error, result) => {
                    let deletedCasino = await this.casinosService.deleteOneById(casinoId);
                    if(deletedCasino) {
                        console.log(this.casinoBonusesCount++,'DONE CASINO')
                    };
                    return resolve(result);
                });
            } catch (error) {
                return resolve();
            }
        });
    }

    async processOneBonus(bonusUrl, casinoId) {
        return new Promise(async (resolve, reject) => {
            try {
                let bonus: any = {};
                bonus['bonusCasino'] = casinoId;
                bonus['bonusUrl'] = bonusUrl;

                // scrape bonus page


                const browser = await puppeteer.launch(chromeOptions);
                const page = await browser.newPage();

                await page.goto(bonusUrl, {
                    waitUntil: 'networkidle2', timeout: 0
                });

                let html = await page.content();
                const $ = cheerio.load(html);

                // bonusName
                bonus['bonusName'] = $('.ch-main').find('.ch-title').text().replace(/\n/g, '').trim();

                // bonusTerms
                bonus['bonusTerms'] = $('.ch-main').find('.terms-popup-text').text().replace(/\n/g, '').trim();

                // bonusType
                bonus['bonusType'] = $('.top10__term:contains("Type")').next().find('a').text().replace(/\n/g, '').trim();

                // bonusMinDeposit
                bonus['bonusMinDeposit'] = $('.top10__term:contains("Minimum Deposit")').next().find('a').text().replace(/\n/g, '').trim();

                // bonusWageringRequirements
                bonus['bonusWageringRequirements'] = $('.top10__term:contains("Wagering requirements")').next().find('a').text().replace(/\n/g, '').trim();

                // bonusMaxAmount
                bonus['bonusMaxAmount'] = $('.top10__term:contains("Maximum Bonus Amount")').next().find('a').text().replace(/\n/g, '').trim();

                // bonusValue
                bonus['bonusValue'] = $('.top10__term:contains("Bonus Value")').next().find('a').text().replace(/\n/g, '').trim();

                // bonusExclusive
                bonus['bonusExclusive'] = $('.top10__term:contains("Exclusive")').next().find('a').text().replace(/\n/g, '').trim();

                // casinoRestrictedCountries
                bonus['bonusRestrictedCountries'] = [];
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
                        bonus['bonusRestrictedCountries'].push(allCountriesAndStates[i]);
                    }
                }

                // bonusAllowedCountries
                bonus['bonusAllowedCountries'] = [];
                let allACountriesAndStates = [];
                let allAStates = [];
                $('.top10__term:contains("Allowed Countries")').next().find('.column-list li').each(function () {
                    let aCountry = {};
                    let aStates = [];

                    let hasStates = $(this).find('.toggle-states');
                    if (hasStates.length > 0) {
                        aCountry['name'] = $(this).text().replace(/\n/g, '').split('[')[0].trim();
                        $(this).find('.state-list li').each(function () {
                            aStates.push($(this).text().replace(/\n/g, '').trim());
                        });
                        aCountry['states'] = aStates;
                        allAStates = allAStates.concat(aStates);
                    } else {
                        aCountry['name'] = $(this).text().replace(/\n/g, '').trim();
                    }
                    allACountriesAndStates.push(aCountry);
                });
                for (let i = 0, l = allACountriesAndStates.length; i < l; i++) {
                    if (!_.contains(allAStates, allACountriesAndStates[i].name)) {
                        bonus['bonusAllowedCountries'].push(allACountriesAndStates[i]);
                    }
                }

                // bonusCashable
                bonus['bonusCashable'] = $('.top10__term:contains("Cashable")').next().find('a').text().replace(/\n/g, '').trim();

                // bonusAllowedGames
                bonus['bonusAllowedGames'] = $('.top10__term:contains("Allowed Games")').next().find('a').text().replace(/\n/g, '').trim();

                // bonusInformation
                bonus['bonusInformation'] = $('.top10__term:contains("Additional information")').next().html();

                // close headless browser and done process one
                await browser.close();


                // save bonus into database
                let savedBonus = await this.bonusesService.add(bonus);
                if (savedBonus) {
                    console.log(bonus.bonusName);
                }
                resolve(bonus);
            } catch (error) {
                resolve();
            }
        });
    }


}




