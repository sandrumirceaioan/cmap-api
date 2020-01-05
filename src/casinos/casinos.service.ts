import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Casino } from './casinos.interface';
import { mapLimit, parallel } from 'async';
import * as moment from 'moment';
import * as _ from 'underscore';
import * as Jimp from 'jimp';
import * as rgb2hex from 'rgb2hex';
import * as fs from 'fs';
import { join } from 'path';
import { promises } from 'dns';
import { CountriesService } from '../countries/countries.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class CasinosService {

    constructor(
        @InjectModel('Casino') private readonly casinoModel: Model<Casino>
    ) { }

    onModuleInit() {
        //this.createCasinoUrl();
    }


    async add(casino): Promise<Casino> {
        let newCasino = new this.casinoModel(casino);
        let response = newCasino.save();
        return response;
    }

    async getAll(): Promise<Casino[]> {
        return await this.casinoModel.find();
    }

    async getBest(): Promise<Casino[]> {
        return await this.casinoModel.find().skip(0).limit(8).sort({ casinoScore: -1 }).select('casinoName casinoScore casinoLogo casinoLogoBg casinoReputation');
    }

    async getAllActive(): Promise<Casino[]> {
        // const casinos = await this.casinoModel.find({ casinoWebsiteUrl: { $ne: "" } });
        const casinos = await this.casinoModel.find();
        let list = [];
        let uniqueCasinos = casinos.filter((casino) => {
            if (!_.contains(list, casino.casinoName)) {
                list.push(casino.casinoName);
                return casino;
            }
        });
        return uniqueCasinos;
    }

    async getGroupedCasinos(): Promise<any> {
        return await this.casinoModel.aggregate([{ $group: { _id: "$casinoName", cs: { $addToSet: "$_id" } } }]);
    }

    async getOneById(id): Promise<Casino> {
        let casino = await this.casinoModel.findOne({ _id: new ObjectId(id) });
        if (!casino) throw new HttpException('Casino not found!', HttpStatus.BAD_REQUEST);
        return casino;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedCasino = await this.casinoModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedCasino) throw new HttpException('Casino not updated!', HttpStatus.BAD_REQUEST);
        return updatedCasino;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedCasino = await this.casinoModel.findByIdAndRemove(query);
        if (!deletedCasino) throw new HttpException('CAsino not deleted!', HttpStatus.BAD_REQUEST);
        return deletedCasino;
    }

    /* admin */

    async countDashboard(): Promise<any> {
        return new Promise((resolve, reject) => {
            let response = {
                all: null,
                published: null
            };
            parallel([
                async () => {
                    response.all = await this.casinoModel.count();
                    return Promise.resolve();
                },
                async () => {
                    response.published = await this.casinoModel.count({
                        casinoPublished: true,
                    });
                    return Promise.resolve();
                }
            ],
                // optional callback
                (err, result) => {
                    if (err) {
                        console.log('Parallel count: ', err);
                        reject(err);
                    }
                    resolve(response);
                });
        });
    }

    async allPaginated(params): Promise<any> {
        console.log(params);
        let sort = {};
        let query = {};

        if (params.search != null) {

            var searchFilter = [];
            searchFilter.push({ casinoName: { $regex: ".*" + params.search + ".*", $options: '-i' } });
            searchFilter.push({ casinoWebsiteUrl: { $regex: ".*" + params.search + ".*", $options: '-i' } });
            searchFilter.push({ casinoLogo: { $regex: ".*" + params.search + ".*", $options: '-i' } });

            query['$or'] = searchFilter;

        }

        sort[params.orderBy] = params.orderDir == 'asc' ? 1 : -1;

        let count = await this.casinoModel.count(query);
        let result: Casino[] = await this.casinoModel.find(query)
            .limit(parseInt(params.limit))
            .skip(parseInt(params.skip))
            .sort(sort)
            .select('_id casinoLogo casinoName casinoDescription casinoWebsiteUrl casinoCreated casinoReputation casinoPublished');

        return { data: result, count: count };
    }

    async getOneByIdAdmin(id): Promise<Casino> {
        let casino = await this.casinoModel.findOne({ _id: new ObjectId(id) });
        if (!casino) throw new HttpException('Casino not found!', HttpStatus.BAD_REQUEST);
        return casino;
    }

}

// used to update reputaion based by score
// async updateReputationByScore(): Promise<Casino[]> {
//     return new Promise(async (resolve, reject) => {
//         let casinos = await this.casinoModel.find();

//         mapLimit(casinos, 1, async (casino, callback) => {
//             let score = parseFloat(casino.casinoScore);
//             let reputation;

//             switch (true) {
//                 case (score == 10):
//                     reputation = "PERFECT";
//                     break;
//                 case (score >= 9.5 && score < 10):
//                     reputation = "EXCELLENT";
//                     break;
//                 case (score >= 9 && score < 9.5):
//                     reputation = "SUPERB";
//                     break;
//                 case (score >= 8.5 && score < 9):
//                     reputation = "GREAT";
//                     break;
//                 case (score >= 8 && score < 8.5):
//                     reputation = "VERY GOOD";
//                     break;
//                 case (score >= 7.5 && score < 8):
//                     reputation = "GOOD";
//                     break;
//                 case (score >= 7 && score < 7.5):
//                     reputation = "FAIR";
//                     break;
//                 case (score < 7):
//                     reputation = "ACCEPTABLE";
//                     break;
//             }

//             let updated = await this.updateOneById(casino._id, {
//                 casinoReputation: reputation
//             });

//             console.log(score, reputation);
//             return Promise.resolve(updated);
//         }, (error, result) => {
//             if (error) console.log('ERROR');
//             console.log('DONE');
//             return resolve(result);
//         });

//     });
// }

// var descriptions = require('./descriptions.json');

// usedDescriptions = {
//     "PERFECT": false,
//     "EXCELLENT": false,
//     "SUPERB": false,
//     "GREAT": false,
//     "VERY GOOD": false,
//     "GOOD": false,
//     "FAIR": false,
//     "ACCEPTABLE": false
// };

// usedPlaceholders = [
//     "casinoName",
//     "casinoReputation",
//     "casinoType",
//     "casinoOwner",
//     "casinoEstablished",
//     "casinoLicensingAuthorities",
//     "casinoSoftwareProviders"
// ];


// async updateDynamicDescription(): Promise<Casino[]> {
//     return new Promise(async (resolve, reject) => {
//         let casinos = await this.casinoModel.find();
//         mapLimit(casinos, 1, async (casino, callback) => {

//             let reputation = casino.casinoReputation;
//             this.usedDescriptions[reputation] = !this.usedDescriptions[reputation];
//             let repIndex = this.usedDescriptions[reputation] ? ' 1' : ' 2';
//             let key = reputation + repIndex;
//             let desc = descriptions[key];

//             for (let i = 0, l = this.usedPlaceholders.length; i < l; i++) {
//                 let replaceValue = '';
//                 if (this.usedPlaceholders[i] === 'casinoSoftwareProviders') {
//                     replaceValue = _.pluck(_.first(casino.casinoSoftwareProviders, 5), 'name').join(', ');
//                 } else {
//                     replaceValue = casino[this.usedPlaceholders[i]];
//                 }

//                 var find = this.usedPlaceholders[i];
//                 var re = new RegExp(find, 'g');
//                 desc = desc.replace(re, '<b>' + replaceValue + '</b>');
//             }

//             let updated = await this.updateOneById(casino._id, {
//                 casinoDescription: desc
//             });

//             return Promise.resolve(updated);
//         }, (error, result) => {
//             if (error) console.log('ERROR: ', error);
//             console.log('DONE');
//             return resolve(result);
//         });

//     });
// }

// update scraped casinos score from string to float
// async updateScoreToFloat(): Promise<any> {
//     return new Promise(async (resolve, reject) => {
//         let casinos = await this.getAllActive();
//         console.log(casinos.length);

//         mapLimit(casinos, 1, async (casino) => {
//             let score = parseFloat(casino.casinoScore);
//             let updated = await this.updateOneById(casino._id, {
//                 casinoScore: score
//             });
//             if (updated) return Promise.resolve(updated);
//         }, (error, result) => {
//             if (error) console.log('ERROR');
//             console.log('DONE');
//             return resolve(result);
//         });

//         return;
//     })
// }



    // // timeout(ms) {
    // //     return new Promise(resolve => setTimeout(resolve, ms));
    // // }

    // async logoBgColor(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let casinos = await this.getAll();
    //         mapLimit(casinos, 1, async (item, callback) => {

    //             // await this.timeout(50);
    //             console.log(item.casinoLogo);
    //             let image = await Jimp.read('http://localhost:3000/' + item.casinoLogo);
    //             let ahex = image.getPixelColor(0, 0);
    //             let color = Jimp.intToRGBA(ahex);
    //             let rgba = `rgba(${color.r}, ${color.g}, ${color.b})`;
    //             let hex = rgb2hex(rgba);
    //             console.log(hex.hex);

    //             await this.updateOneById(item._id, {casinoLogoBg: hex.hex});

    //             return Promise.resolve(item);
    //         }, (error, result) => {
    //             if (error) {
    //                 console.log('ERROR: ', error);
    //                 return resolve();
    //             }
    //             console.log('DONE: ', result.length);
    //             return resolve(result);
    //         });

    //     });
    // }

    // PERFECT WORKING
    // async updateCasinosAndLogos(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let casinos = await this.getAll();
    //         let index = 0;

    //         mapLimit(casinos, 1, async (casino) => {
    //             index++;
    //             await this.timeout(50);
    //             let logoPath = join(__dirname + './../../assets/casinos/' + casino.casinoLogo);

    //             let logoExt = casino.casinoLogo.split('.').pop();
    //             let logoName = casino.casinoLogo.split('.').shift();

    //             let newLogoPath = join(__dirname + './../../assets/casinos/' + 'review-' + logoName + '-' + 'online' + '.' + logoExt);
    //             let slotLogoNew = 'review-' + logoName + '-' + 'online' + '.' + logoExt;

    //             // console.log(logoPath);
    //             // console.log(logoExt);
    //             // console.log(logoName);
    //             // console.log(newLogoPath);

    //             if (fs.existsSync(logoPath)) {
    //                 let logo = await Jimp.read(logoPath);
    //                 if (!logo) return Promise.reject();
    //                 logo
    //                     .crop(5, 5, 140, 140)
    //                     .quality(100)
    //                     .write(newLogoPath);
    //                 await this.updateOneById(casino._id, {casinoLogo: slotLogoNew});
    //                 console.log(index);
    //             } else {
    //                 console.log('NOT EXISTS');
    //             }

    //             return Promise.resolve(casino.casinoLogo);
    //         }, async (err, result) => {
    //             if (err) {
    //                 console.log('ERROR', err);
    //             } else {
    //                 console.log('RESULT: ', result);
    //                 return resolve(result);
    //             }
    //         });

    //     });
    // }


    // async convertToSlug(Text) {
    //     return new Promise((resolve, reject) => {
    //         let res = Text
    //             .toLowerCase()
    //             .replace(/[^\w ]+/g, '')
    //             .replace(/ +/g, '-')
    //             ;
    //         return resolve(res + '-review');
    //     });
    // }

    // async createCasinoUrl(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let casinos = await this.getAll();
    //         mapLimit(casinos, 1, async (casino) => {
    //             let slug = await this.convertToSlug(casino.casinoName);
    //             console.log(slug);
    //             let updated = await this.updateOneById(casino._id, {casinoUrl: slug})
    //             if (updated) return Promise.resolve(slug);
    //         }, (error, result) => {
    //             if (error) console.log(error);
    //             console.log(result.length);
    //         });
    //     });
    // }

    // timeout(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }