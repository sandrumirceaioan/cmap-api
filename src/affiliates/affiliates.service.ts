import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Affiliate } from './affiliates.interface';
import * as _ from 'underscore';

const ObjectId = Types.ObjectId;

@Injectable()
export class AffiliatesService {

    constructor(
        @InjectModel('Affiliate') private readonly affiliateModel: Model<Affiliate>
    ) { }

    async add(affiliate): Promise<Affiliate> {
        let newAffiliate = new this.affiliateModel(affiliate);
        let response = newAffiliate.save();
        return response;
    }

    async getAll(): Promise<Affiliate[]> {
        return await this.affiliateModel.find();
    }


    async getOneById(id): Promise<Affiliate> {
        let affiliate = await this.affiliateModel.findOne({_id: new ObjectId(id)});
        if (!affiliate) throw new HttpException('Affiliate not found!', HttpStatus.BAD_REQUEST);
        return affiliate;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedAffiliate = await this.affiliateModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedAffiliate) throw new HttpException('Affiliate not updated!', HttpStatus.BAD_REQUEST);
        return updatedAffiliate;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedAffiliate = await this.affiliateModel.findByIdAndRemove(query);
        if (!deletedAffiliate) throw new HttpException('Affiliate not deleted!', HttpStatus.BAD_REQUEST);
        return deletedAffiliate;
    }
}
