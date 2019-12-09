import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bonus } from './bonuses.interface';
import * as _ from 'underscore';
import { mapLimit, parallel } from 'async';

const ObjectId = Types.ObjectId;

@Injectable()
export class BonusesService {

    constructor(
        @InjectModel('Bonus') private readonly bonusModel: Model<Bonus>
    ) { }

    async add(bonus): Promise<Bonus> {
        let newBonus = new this.bonusModel(bonus);
        let response = newBonus.save();
        return response;
    }

    async getAll(): Promise<Bonus[]> {
        return await this.bonusModel.find();
    }

    async getGroupedBonuses(): Promise<any> {
        return await this.bonusModel.aggregate([{$group:{ _id:"$bonusName", casinos: { $addToSet :  "$bonusCasino" }, ids: { $addToSet: "$_id"}}}]);
    }

    async getOneById(id): Promise<Bonus> {
        let bonus = await this.bonusModel.findOne({_id: new ObjectId(id)});
        if (!bonus) throw new HttpException('Bonus not found!', HttpStatus.BAD_REQUEST);
        return bonus;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedBonus = await this.bonusModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedBonus) throw new HttpException('Bonus not updated!', HttpStatus.BAD_REQUEST);
        return updatedBonus;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedBonus = await this.bonusModel.findByIdAndRemove(query);
        if (!deletedBonus) throw new HttpException('Bonus not deleted!', HttpStatus.BAD_REQUEST);
        return deletedBonus;
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
                        response.all = await this.bonusModel.count();
                        return Promise.resolve();
                    },
                    async () => {
                        response.published = await this.bonusModel.count({
                            bonusPublished: true,
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
}
