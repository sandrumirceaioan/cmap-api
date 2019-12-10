import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as request from 'request';
import { eachLimit, map, mapLimit } from 'async';
import { CasinosService } from '../casinos/casinos.service';
import * as fs from 'fs';
import * as fetch from 'node-fetch';
import * as puppeteer from 'puppeteer';
import * as _ from 'underscore';
import * as htmlToText from 'html-to-text';
import { BonusesService } from '../bonuses/bonuses.service';
import { ProvidersService } from '../providers/providers.service';
import { PaymentMethodsService } from '../payments/paymet-methods.service';
import * as rp from 'request-promise';
import * as path from 'path';
import * as util from 'util';

const chromeOptions = {
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true
};

const LOGIN_URL = 'https://portal.mymark-media.com/login';
const USERNAME_SELECTOR = '#form-login__email';
const PASSWORD_SELECTOR = '#form-login__pass';
const CTA_SELECTOR = '.flex-aic button';

const USER_NAME = 'info@clickmoola.com';
const PASSWORD = 'jyS7OXhyxF5rSga8';

// User: info@clickmoola.com
// Password: jyS7OXhyxF5rSga8

@Injectable()
export class MarkMediaService {
    constructor() { }
    cookies: any[] = [];

    async onModuleInit() {
        let all = await this.loginWebsite(LOGIN_URL, USER_NAME, PASSWORD);
        var json = JSON.stringify(all);
        const where = path.resolve(
            process.cwd(),
            `downloads/allData.json`,
        );
        fs.writeFile(where, json, function (err) {
            if (err) throw err;
            console.log('complete');
        }
        );
    }


    async loginWebsite(loginurl, username, password): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let categoryPages = [];
            let items = [];

            // login to website and get cookies
            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();
            await page.goto(loginurl);
            await page.click(USERNAME_SELECTOR);
            await page.keyboard.type(username);
            await page.click(PASSWORD_SELECTOR);
            await page.keyboard.type(password);
            await page.click(CTA_SELECTOR);
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

            // ebooks category
            for (let i = 1; i < 25; i++) {
                categoryPages.push({
                    url: 'https://portal.mymark-media.com/category/ebooks?page=' + i,
                    category: 'ebooks'
                });
            }
            // audio category
            for (let j = 1; j < 6; j++) {
                categoryPages.push({
                    url: 'https://portal.mymark-media.com/category/audio?page=' + j,
                    category: 'audio'
                });
            }
            // video category
            for (let k = 1; k < 3; k++) {
                categoryPages.push({
                    url: 'https://portal.mymark-media.com/category/video?page=' + k,
                    category: 'video'
                });
            }

            mapLimit(categoryPages, 1, async (categoryPage) => {
                await page.goto(categoryPage.url);
                let html = await page.content();
                let $ = cheerio.load(html);

                $('.cat').each(function () {
                    items.push({
                        type: categoryPage.category,
                        url: $(this).find('a').first().attr('href'),
                    });
                });

                return Promise.resolve();
            }, (error, result) => {

                // items = [items[0], items[1]];
                let finalItems = [];
                console.log(items.length);
                for (let i=0; i< items.length; i++) {
                    if (items[i].url != 'https://portal.mymark-media.com/detail-page/22') {
                        finalItems.push(items[i]);
                    }
                }
                console.log(finalItems);

                mapLimit(finalItems, 1, async (item) => {
                    
                    await page.goto(item.url,
                        { waitUntil: 'domcontentloaded' },
                    );
                    let html = await page.content();
                    let $ = cheerio.load(html);

                    let title = $('.content').find('h3').text();
                    let description = $('.content').find('p').text();
                    let downloadUrl = $('.btns-holder').find('a').first().attr('href');
                    let category = item.type;

                    console.log(downloadUrl);


                    const path: any = await this.download(title, page, () => 
                        page.click('.btn')
                    );

                    let downloaded = {
                        title,
                        description,
                        category,
                        filename: path.fileName,
                    };

                    return Promise.resolve(downloaded);
                }, async (error, result) => {
                    console.log('DONE');
                    await browser.close();
                    return resolve(result);
                });

            });

        });
    }

    // set up, invoke the function, wait for the download to complete
    async download(title, page, f) {
        return new Promise(async (resolve, reject) => {
            try {
                const downloadPath = path.resolve(
                    process.cwd(),
                    `downloads/${title}`,
                );
                await util.promisify(fs.mkdir)(downloadPath);

                await page._client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: downloadPath,
                });

                await f();

                console.error('Downloading...');
                let fileName;
                while (!fileName || fileName.endsWith('.crdownload')) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    [fileName] = await util.promisify(fs.readdir)(downloadPath);
                }

                const filePath = path.resolve(downloadPath, fileName);
                return resolve({ filePath, fileName });
            } catch (error) {
                return resolve();
            }
        });
    }


}




