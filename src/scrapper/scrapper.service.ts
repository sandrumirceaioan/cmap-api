import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as request from 'request';
import { eachLimit } from 'async';
import { CasinosService } from '../casinos/casinos.service';
import * as fs from 'fs';
import { join, posix } from 'path';
import * as fetch from 'node-fetch';

@Injectable()
export class ScrapperService {

    constructor(
        private casinosService: CasinosService
    ) {
    }

    async scrapeUrl(data): Promise<any> {
        let url = 'https://casino.guru/casinoFilterServiceMore?page=';
        let urls = [];
        let all = [];
        for (let i = 0; i < 22; i++) {
            urls.push(url + (i + 1));
        }
        return new Promise((resolve, reject) => {
            eachLimit(urls, 10, (url, callback) => {
                this.processUrl(url).then((result) => {
                    this.saveCasino(result).then((cas) => {
                        all = all.concat(cas);
                    });
                    callback();
                }).catch((error) => {
                    callback(error);
                });
            }, (err) => {
                if (err) {
                    return console.log('SCRAPE ERROR', err);
                } else {
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

    saveCasino(casinos) {
        let savedCasinos = [];
        return new Promise((resolve, reject) => {
            eachLimit(casinos, 10, async (cs, callback) => {
                let casino = await this.casinosService.add({
                    casinoName: cs.title,
                    casinoUrlDetails: cs.href,
                    casinoLogo: cs.image
                });
                let parsedSrc = new URL(casino.casinoLogo.toString());
                if (casino) {
                    let fn = parsedSrc.origin + parsedSrc.pathname;
                    let originalFileName = parsedSrc.pathname.split('/')[3] + '.jpg';
                    let uploaded = await this.uploadFile(fn, originalFileName);
                }
                savedCasinos = savedCasinos.concat(casino);
                return Promise.resolve(casino);
            }, (err) => {
                if (err) {
                    return console.log('SCRAPE ERROR', err);
                } else {
                    return Promise.resolve(savedCasinos);
                }
            });
        });
    }

    async uploadFile(document, fileName) {
        return new Promise(async (resolve, reject) => {
            let filePath = '/downloads/';

            if (!fs.existsSync(join(process.cwd(), filePath))) fs.mkdirSync(join(process.cwd(), filePath));

            let fullPath = join(process.cwd(), filePath, fileName);

            request({
                method: 'HEAD',
                url: document,
                followRedirect: false
            }, async (err, resp) => {
                if (err || resp.statusCode !== 200) return resolve();
                const response = await fetch(document);
                let writer = fs.createWriteStream(fullPath);
                response.body.pipe(writer);
                writer.on('finish', async (result) => {
                    writer.end();
                });
                writer.on('error', (error) => {
                    resolve();
                    writer.end();
                });
            });


        });
    }

}




