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
export class BonusesAskgamblersService {
    casinoBonusesCount = 0;
    constructor(
        private casinosService: CasinosService,
        private bonusesService: BonusesService
    ) {
    }

    async onModuleInit() {

    }

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




