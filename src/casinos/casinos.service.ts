import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Casino } from './casinos.interface';
import { eachLimit, map, mapLimit } from 'async';
import * as _ from 'underscore';

const ObjectId = Types.ObjectId;

@Injectable()
export class CasinosService {

    constructor(
        @InjectModel('Casino') private readonly casinoModel: Model<Casino>
    ) { }

    onModuleInit() {
    }

    async add(casino): Promise<Casino> {
        let newCasino = new this.casinoModel(casino);
        let response = newCasino.save();
        return response;
    }

    async getAll(): Promise<Casino[]> {
        return await this.casinoModel.find();
    }

    async getAllActive(): Promise<Casino[]> {
        const casinos = await this.casinoModel.find({ casinoWebsiteUrl: { $ne: "" } });
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